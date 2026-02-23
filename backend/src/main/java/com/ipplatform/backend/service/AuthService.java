package com.ipplatform.backend.service;

import com.ipplatform.backend.exception.AuthException;
import com.ipplatform.backend.model.PasswordResetToken;
import com.ipplatform.backend.model.RefreshToken;
import com.ipplatform.backend.model.Role;
import com.ipplatform.backend.model.User;
import com.ipplatform.backend.model.User.AccountStatus;
import com.ipplatform.backend.repository.PasswordResetTokenRepository;
import com.ipplatform.backend.repository.RefreshTokenRepository;
import com.ipplatform.backend.repository.UserRepository;
import com.ipplatform.backend.security.JwtUtil;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

/**
 * Central authentication service.
 *
 * ── REGISTRATION FLOW ────────────────────────────────────────────────────────
 *
 *  Role = USER
 *    → account created with status ACTIVE
 *    → welcome email sent
 *    → returns null (frontend redirects to /login)
 *
 *  Role = ANALYST
 *    → account created with status PENDING_DOCUMENT
 *    → empty AnalystApplication created (AWAITING_DOCUMENTS)
 *    → "Application received" email sent
 *    → JWT returned immediately
 *    → frontend navigates to /submit-documents using that token
 *    → analyst uploads identity proof: POST /api/analyst/application/documents
 *    → analyst submits: POST /api/analyst/application/submit
 *    → account status → PENDING_REVIEW, application → SUBMITTED
 *    → admin reviews at GET /api/admin/analyst-applications/pending
 *    → admin approves → ACTIVE (can login now)
 *    → admin rejects  → REJECTED (blocked permanently unless re-applied)
 *
 * ── LOGIN BLOCKING ────────────────────────────────────────────────────────────
 *   PENDING_DOCUMENT → blocked: "Upload your identity documents"
 *   PENDING_REVIEW   → blocked: "Under admin review"
 *   REJECTED         → blocked: "Application rejected"
 *   SUSPENDED        → blocked: "Account suspended"
 *   ACTIVE           → allowed
 */
@Service
@Transactional
public class AuthService {

    // ── Configurable values from application.properties ───────────────────────
    @Value("${auth.refresh-token-expiry-days:7}")
    private int normalRefreshDays;

    @Value("${auth.remember-me-expiry-days:30}")
    private int rememberMeDays;

    @Value("${auth.password-reset-expiry-minutes:60}")
    private int passwordResetMinutes;

    // ── Dependencies ──────────────────────────────────────────────────────────
    private final UserRepository               userRepository;
    private final RefreshTokenRepository       refreshTokenRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final PasswordEncoder              passwordEncoder;
    private final JwtUtil                      jwtUtil;
    private final EmailService                 emailService;
    private final AnalystApplicationService    analystApplicationService;

    /**
     * @Lazy on AnalystApplicationService breaks the circular dependency:
     *   AuthService → AnalystApplicationService → (repositories) ← AuthService
     */
    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordResetTokenRepository resetTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            EmailService emailService,
            @Lazy AnalystApplicationService analystApplicationService) {

        this.userRepository            = userRepository;
        this.refreshTokenRepository    = refreshTokenRepository;
        this.resetTokenRepository      = resetTokenRepository;
        this.passwordEncoder           = passwordEncoder;
        this.jwtUtil                   = jwtUtil;
        this.emailService              = emailService;
        this.analystApplicationService = analystApplicationService;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. REGISTER
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Creates a new local user account.
     *
     * @param roleInput  "USER" or "ANALYST" — comes from the frontend dropdown
     * @return TokenPair for ANALYST (so they can immediately upload documents),
     *         null for USER (they go straight to /login)
     */
    public TokenPair register(String username, String email,
                              String password, String name, String roleInput) {

        // ── Uniqueness checks ─────────────────────────────────────────────────
        if (userRepository.findByUsername(username).isPresent()) {
            throw new AuthException("Username already taken");
        }
        if (userRepository.existsByEmail(email)) {
            throw new AuthException("Email already registered");
        }

        validatePasswordStrength(password);

        // ── Resolve and restrict role ─────────────────────────────────────────
        Role selectedRole;
        try {
            selectedRole = Role.valueOf("ROLE_" + roleInput.toUpperCase());
        } catch (Exception e) {
            throw new AuthException("Invalid role. Allowed values: USER, ANALYST");
        }

        // Only USER and ANALYST can self-register — ADMIN is seeded only
        if (selectedRole != Role.ROLE_USER && selectedRole != Role.ROLE_ANALYST) {
            throw new AuthException("Registration is only allowed for USER or ANALYST roles.");
        }

        boolean isAnalyst = (selectedRole == Role.ROLE_ANALYST);

        // ── Create user ───────────────────────────────────────────────────────
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setName(name != null && !name.isBlank() ? name : username);
        user.setProvider("local");
        user.setPassword(passwordEncoder.encode(password));
        user.setRoles(List.of(selectedRole.value()));

        // USER  → ACTIVE immediately (can login right after registration)
        // ANALYST → PENDING_DOCUMENT (must upload identity proof before login)
        user.setAccountStatus(isAnalyst ? AccountStatus.PENDING_DOCUMENT : AccountStatus.ACTIVE);

        userRepository.save(user);

        // ── Post-registration ─────────────────────────────────────────────────
        if (isAnalyst) {
            // Create the application shell — analyst will fill it with documents next
            analystApplicationService.createApplicationForUser(user);

            try { emailService.sendAnalystPendingEmail(email, user.getName()); }
            catch (Exception ignored) {}

            // Issue JWT so frontend can authenticate document upload requests
            // (The login() method still blocks them until status = ACTIVE)
            return issueTokenPair(user, false);

        } else {
            try { emailService.sendWelcomeEmail(email, user.getName()); }
            catch (Exception ignored) {}

            // USER goes to /login — no token needed at registration
            return null;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. LOGIN
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Authenticates username + password.
     * Any non-ACTIVE account status blocks login with a descriptive message.
     *
     * @param rememberMe  true → 30-day refresh token; false → 7-day refresh token
     */
    public TokenPair login(String username, String password, boolean rememberMe) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AuthException("Invalid credentials"));

        // OAuth users have no stored password
        if (user.getPassword() == null) {
            throw new AuthException(
                "This account uses Google login. Please sign in with Google.");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new AuthException("Invalid credentials");
        }

        // ── Block non-ACTIVE accounts with a specific message ─────────────────
        switch (user.getAccountStatus()) {
            case PENDING_DOCUMENT ->
                throw new AuthException(
                    "Your analyst account is incomplete. Please upload your " +
                    "identity documents to continue.");
            case PENDING_REVIEW ->
                throw new AuthException(
                    "Your identity documents are currently under admin review. " +
                    "You will receive an email once a decision has been made.");
            case REJECTED ->
                throw new AuthException(
                    "Your analyst application was rejected. " +
                    "Please contact support for more information.");
            case SUSPENDED ->
                throw new AuthException(
                    "Your account has been suspended. Please contact support.");
            default -> { /* ACTIVE — proceed to issue tokens */ }
        }

        return issueTokenPair(user, rememberMe);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. REFRESH TOKEN (with rotation)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Validates the stored refresh token, revokes it, issues a new pair.
     *
     * Token rotation security:
     * If a revoked token is presented (possible replay/theft),
     * ALL tokens for that user are revoked — forcing a full re-login.
     */
    public TokenPair refresh(String rawRefreshToken) {
        RefreshToken stored = refreshTokenRepository.findByToken(rawRefreshToken)
                .orElseThrow(() -> new AuthException("Invalid refresh token"));

        if (!stored.isValid()) {
            // Possible stolen token — revoke everything for this user
            refreshTokenRepository.revokeAllByUser(stored.getUser());
            throw new AuthException("Refresh token expired or revoked. Please log in again.");
        }

        // Rotate: mark old token as used, issue fresh pair
        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        return issueTokenPair(stored.getUser(), stored.isRememberMe());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. LOGOUT
    // ─────────────────────────────────────────────────────────────────────────

    /** Revokes a single refresh token — logs out one device. */
    public void logout(String rawRefreshToken) {
        refreshTokenRepository.findByToken(rawRefreshToken).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    /** Revokes ALL refresh tokens for a user — logs out every device. */
    public void logoutAll(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AuthException("User not found"));
        refreshTokenRepository.revokeAllByUser(user);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. FORGOT PASSWORD
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Generates a one-time reset token and emails it to the user.
     * Always returns success even if email not found — prevents user enumeration.
     */
    public void forgotPassword(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            // OAuth users have no password to reset
            if (!"local".equals(user.getProvider())) return;

            // Replace any existing unused tokens
            resetTokenRepository.deleteAllByUser(user);

            String token   = UUID.randomUUID().toString();
            Instant expiry = Instant.now().plus(passwordResetMinutes, ChronoUnit.MINUTES);
            resetTokenRepository.save(new PasswordResetToken(token, user, expiry));

            emailService.sendPasswordResetEmail(email, token);
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 6. RESET PASSWORD
    // ─────────────────────────────────────────────────────────────────────────

    /** Consumes the reset token, sets the new password, revokes all sessions. */
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

        resetToken.setUsed(true);
        resetTokenRepository.save(resetToken);

        // Force re-login everywhere with the new password
        refreshTokenRepository.revokeAllByUser(user);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 7. CHANGE PASSWORD (logged-in user)
    // ─────────────────────────────────────────────────────────────────────────

    /** Requires current password confirmation before setting the new password. */
    public void changePassword(String username, String currentPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AuthException("User not found"));

        if (user.getPassword() == null ||
                !passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new AuthException("Current password is incorrect");
        }

        validatePasswordStrength(newPassword);

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Revoke all sessions — user stays logged in on current device via new login
        refreshTokenRepository.revokeAllByUser(user);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 8. GET CURRENT USER
    // ─────────────────────────────────────────────────────────────────────────

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AuthException("User not found"));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 9. OAUTH2 PROVISIONING
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Called by OAuth2AuthenticationSuccessHandler after Google authenticates.
     *
     * Cases:
     *  - Returning Google user (providerId match)  → update name, issue tokens
     *  - Existing local user with same email       → link Google to account
     *  - Brand new user                            → create with ROLE_USER + ACTIVE
     *
     * Google users are always ACTIVE — no document verification for OAuth.
     */
    public TokenPair provisionOAuthUser(String email, String name,
                                        String googleId, String pictureUrl) {
        User user = userRepository
                .findByProviderAndProviderId("google", googleId)
                .orElseGet(() ->
                    userRepository.findByEmail(email)
                        .orElseGet(() -> {
                            User newUser = new User();
                            newUser.setUsername(generateOAuthUsername(email));
                            newUser.setEmail(email);
                            newUser.setName(name);
                            newUser.setProvider("google");
                            newUser.setProviderId(googleId);
                            newUser.setRoles(List.of(Role.ROLE_USER.value()));
                            newUser.setAccountStatus(AccountStatus.ACTIVE);
                            return newUser;
                        })
                );

        // Sync latest Google profile info
        user.setName(name);
        user.setProvider("google");
        user.setProviderId(googleId);
        userRepository.save(user);

        return issueTokenPair(user, false);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    /** Generates a JWT access token and persists a refresh token in the DB. */
    private TokenPair issueTokenPair(User user, boolean rememberMe) {
        String accessToken = jwtUtil.generateAccessToken(user.getUsername(), user.getRoles());

        int     expiryDays     = rememberMe ? rememberMeDays : normalRefreshDays;
        String  rawRefreshToken = jwtUtil.generateRefreshToken(user.getUsername());
        Instant expiresAt      = Instant.now().plus(expiryDays, ChronoUnit.DAYS);

        RefreshToken dbToken = new RefreshToken(rawRefreshToken, user, expiresAt, rememberMe);
        refreshTokenRepository.save(dbToken);

        return new TokenPair(accessToken, rawRefreshToken, user);
    }

    private void validatePasswordStrength(String password) {
        if (password == null || password.length() < 8)
            throw new AuthException("Password must be at least 8 characters");
        if (!password.matches(".*[A-Z].*"))
            throw new AuthException("Password must contain at least one uppercase letter");
        if (!password.matches(".*[0-9].*"))
            throw new AuthException("Password must contain at least one number");
    }

    private String generateOAuthUsername(String email) {
        String base      = email.split("@")[0].replaceAll("[^a-zA-Z0-9]", "");
        String candidate = base;
        int    suffix    = 1;
        while (userRepository.findByUsername(candidate).isPresent()) {
            candidate = base + suffix++;
        }
        return candidate;
    }

    // ── Value object returned from login / register / refresh ─────────────────
    public record TokenPair(String accessToken, String refreshToken, User user) {}
}