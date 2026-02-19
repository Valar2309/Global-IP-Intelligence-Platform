package com.ipplatform.backend.service;

import com.ipplatform.backend.exception.AuthException;
import com.ipplatform.backend.model.PasswordResetToken;
import com.ipplatform.backend.model.RefreshToken;
import com.ipplatform.backend.model.Role;
import com.ipplatform.backend.model.User;
import com.ipplatform.backend.repository.PasswordResetTokenRepository;
import com.ipplatform.backend.repository.RefreshTokenRepository;
import com.ipplatform.backend.repository.UserRepository;
import com.ipplatform.backend.security.JwtUtil;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

/**
 * Central service for ALL authentication operations.
 *
 * Covers:
 *  1. Register (local signup)
 *  2. Login (with Remember Me)
 *  3. Token refresh (with rotation)
 *  4. Logout (revoke refresh token)
 *  5. Forgot password (generate + email reset token)
 *  6. Reset password (consume token, set new password)
 *  7. Change password (logged-in user)
 *  8. OAuth2 user provisioning (called by OAuth2SuccessHandler)
 */
@Service
@Transactional
public class AuthService {

    // ── Configurable token lifetimes ──────────────────────────────────────────
    @Value("${auth.refresh-token-expiry-days:7}")
    private int normalRefreshDays;

    @Value("${auth.remember-me-expiry-days:30}")
    private int rememberMeDays;

    @Value("${auth.password-reset-expiry-minutes:60}")
    private int passwordResetMinutes;

    // ── Dependencies ──────────────────────────────────────────────────────────
    private final UserRepository            userRepository;
    private final RefreshTokenRepository    refreshTokenRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final PasswordEncoder           passwordEncoder;
    private final JwtUtil                   jwtUtil;
    private final EmailService              emailService;

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       PasswordResetTokenRepository resetTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       EmailService emailService) {
        this.userRepository         = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.resetTokenRepository   = resetTokenRepository;
        this.passwordEncoder        = passwordEncoder;
        this.jwtUtil                = jwtUtil;
        this.emailService           = emailService;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. REGISTER
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Creates a new local user account.
     * New users always receive ROLE_USER (admin can promote later).
     * Sends a welcome email after successful registration.
     */
    public void register(String username, String email, String password, String name) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new AuthException("Username already taken");
        }
        if (userRepository.existsByEmail(email)) {
            throw new AuthException("Email already registered");
        }
        validatePasswordStrength(password);

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setName(name != null ? name : username);
        user.setProvider("local");
        user.setPassword(passwordEncoder.encode(password));
        user.setRoles(List.of(Role.ROLE_USER.value()));

        userRepository.save(user);

        // Non-blocking — if email fails, registration still succeeds
        try { emailService.sendWelcomeEmail(email, user.getName()); }
        catch (Exception ignored) {}
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. LOGIN (local)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Authenticates username/password and returns a token pair.
     *
     * @param rememberMe  true → 30-day refresh token stored in DB
     *                    false → 7-day refresh token stored in DB
     */
    public TokenPair login(String username, String password, boolean rememberMe) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AuthException("Invalid credentials"));

        if (user.getPassword() == null) {
            throw new AuthException("This account uses Google login. Please sign in with Google.");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new AuthException("Invalid credentials");
        }

        return issueTokenPair(user, rememberMe);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. REFRESH TOKEN (with rotation)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Accepts the current refresh token, revokes it, and issues a new pair.
     * Token rotation means a stolen refresh token can only be used once —
     * the legitimate user's next use will detect the conflict.
     */
    public TokenPair refresh(String rawRefreshToken) {
        RefreshToken stored = refreshTokenRepository.findByToken(rawRefreshToken)
                .orElseThrow(() -> new AuthException("Invalid refresh token"));

        if (!stored.isValid()) {
            // Token is revoked or expired — revoke ALL tokens for this user
            // (possible token theft — force full re-login)
            refreshTokenRepository.revokeAllByUser(stored.getUser());
            throw new AuthException("Refresh token expired or revoked. Please log in again.");
        }

        // Revoke the used token (rotation)
        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        return issueTokenPair(stored.getUser(), stored.isRememberMe());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. LOGOUT
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Revokes the provided refresh token.
     * The access token will expire naturally (short-lived by design).
     * Pass the refresh token from the client's storage.
     */
    public void logout(String rawRefreshToken) {
        refreshTokenRepository.findByToken(rawRefreshToken).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    /**
     * Logs out from ALL devices by revoking every refresh token for the user.
     */
    public void logoutAll(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AuthException("User not found"));
        refreshTokenRepository.revokeAllByUser(user);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. FORGOT PASSWORD
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Generates a one-time password reset token and emails it to the user.
     *
     * IMPORTANT: Always returns a success message even if the email isn't found.
     * This prevents user enumeration attacks (attacker can't tell if email exists).
     */
    public void forgotPassword(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            // OAuth users have no password — skip silently
            if (!"local".equals(user.getProvider())) return;

            // Delete any existing tokens for this user before creating a new one
            resetTokenRepository.deleteAllByUser(user);

            String token = UUID.randomUUID().toString();
            Instant expiry = Instant.now().plus(passwordResetMinutes, ChronoUnit.MINUTES);

            resetTokenRepository.save(new PasswordResetToken(token, user, expiry));

            emailService.sendPasswordResetEmail(email, token);
        });
        // Return nothing — caller always gets a 200 OK (see controller)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 6. RESET PASSWORD
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Validates the reset token and sets the new password.
     * Marks the token as used and revokes all refresh tokens (force re-login).
     */
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = resetTokenRepository.findByToken(token)
                .orElseThrow(() -> new AuthException("Invalid or expired reset link"));

        if (!resetToken.isValid()) {
            throw new AuthException("Reset link has expired. Please request a new one.");
        }

        validatePasswordStrength(newPassword);

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark token as used so it can't be replayed
        resetToken.setUsed(true);
        resetTokenRepository.save(resetToken);

        // Revoke all sessions — user must log in with new password
        refreshTokenRepository.revokeAllByUser(user);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 7. CHANGE PASSWORD (logged-in user)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Allows a logged-in user to change their own password.
     * Requires current password for confirmation.
     */
    public void changePassword(String username, String currentPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AuthException("User not found"));

        if (user.getPassword() == null || !passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new AuthException("Current password is incorrect");
        }

        validatePasswordStrength(newPassword);

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Revoke all OTHER sessions (keep the current one — user stays logged in)
        refreshTokenRepository.revokeAllByUser(user);
    }
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AuthException("User not found"));
    }
    // ─────────────────────────────────────────────────────────────────────────
    // 8. OAUTH2 USER PROVISIONING
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Called by OAuth2AuthenticationSuccessHandler after Google authenticates a user.
     *
     * Logic:
     *  - If user exists with this Google providerId → update name/email and return
     *  - If user exists with same email (prev local account) → link Google to it
     *  - If new user → create with ROLE_USER, provider=google
     */
     
    public TokenPair provisionOAuthUser(String email, String name,
                                        String googleId, String pictureUrl) {
        User user = userRepository
                .findByProviderAndProviderId("google", googleId)
                .orElseGet(() ->
                    userRepository.findByEmail(email)
                        .orElseGet(() -> {
                            // Brand new user via Google
                            User newUser = new User();
                            newUser.setUsername(generateOAuthUsername(email));
                            newUser.setEmail(email);
                            newUser.setName(name);
                            newUser.setProvider("google");
                            newUser.setProviderId(googleId);
                            newUser.setRoles(List.of(Role.ROLE_USER.value()));
                            return newUser;
                        })
                );

        // Keep profile in sync with Google
        user.setName(name);
        user.setProvider("google");
        user.setProviderId(googleId);
        userRepository.save(user);

        return issueTokenPair(user, false);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Issues an access token + stores a new refresh token in the DB.
     */
    private TokenPair issueTokenPair(User user, boolean rememberMe) {
        String accessToken = jwtUtil.generateAccessToken(user.getUsername(), user.getRoles());

        // Build and persist the refresh token
        int expiryDays = rememberMe ? rememberMeDays : normalRefreshDays;
        String rawRefreshToken = jwtUtil.generateRefreshToken(user.getUsername());
        Instant expiresAt = Instant.now().plus(expiryDays, ChronoUnit.DAYS);

        RefreshToken dbToken = new RefreshToken(rawRefreshToken, user, expiresAt, rememberMe);
        refreshTokenRepository.save(dbToken);

        return new TokenPair(accessToken, rawRefreshToken, user);
    }

    private void validatePasswordStrength(String password) {
        if (password == null || password.length() < 8) {
            throw new AuthException("Password must be at least 8 characters");
        }
        if (!password.matches(".*[A-Z].*")) {
            throw new AuthException("Password must contain at least one uppercase letter");
        }
        if (!password.matches(".*[0-9].*")) {
            throw new AuthException("Password must contain at least one number");
        }
    }

    private String generateOAuthUsername(String email) {
        // base username from email prefix, ensure uniqueness
        String base = email.split("@")[0].replaceAll("[^a-zA-Z0-9]", "");
        String candidate = base;
        int suffix = 1;
        while (userRepository.findByUsername(candidate).isPresent()) {
            candidate = base + suffix++;
        }
        return candidate;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TOKEN PAIR VALUE OBJECT
    // ─────────────────────────────────────────────────────────────────────────

    public record TokenPair(String accessToken, String refreshToken, User user) {}
}