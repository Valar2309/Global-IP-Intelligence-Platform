package com.ipplatform.backend.service;

import com.ipplatform.backend.exception.AuthException;
import com.ipplatform.backend.model.PasswordResetToken;
import com.ipplatform.backend.model.RefreshToken;
import com.ipplatform.backend.model.User;
import com.ipplatform.backend.repository.AnalystRepository;
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
 * Handles USER registration, login, and password management exclusively.
 * Users are immediately ACTIVE after registration — no approval needed.
 *
 * Cross-table uniqueness: username and email are checked against BOTH
 * the users AND analysts tables to prevent conflicts.
 */
@Service
@Transactional
public class UserService {

    @Value("${auth.refresh-token-expiry-days:7}")
    private int refreshDays;

    @Value("${auth.remember-me-expiry-days:30}")
    private int rememberMeDays;

    @Value("${auth.password-reset-expiry-minutes:60}")
    private int passwordResetMinutes;

    private final UserRepository              userRepository;
    private final AnalystRepository           analystRepository;
    private final RefreshTokenRepository      refreshTokenRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final PasswordEncoder             passwordEncoder;
    private final JwtUtil                     jwtUtil;
    private final EmailService                emailService;

    public UserService(UserRepository userRepository,
                       AnalystRepository analystRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       PasswordResetTokenRepository resetTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       EmailService emailService) {
        this.userRepository         = userRepository;
        this.analystRepository      = analystRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.resetTokenRepository   = resetTokenRepository;
        this.passwordEncoder        = passwordEncoder;
        this.jwtUtil                = jwtUtil;
        this.emailService           = emailService;
    }

    // ── Register ──────────────────────────────────────────────────────────────

    /**
     * POST /api/user/register
     * Creates a USER account. Active immediately — no approval needed.
     * Checks uniqueness across BOTH users and analysts tables.
     */
    public void register(String username, String email, String password, String name) {
        if (userRepository.existsByUsername(username) || analystRepository.existsByUsername(username))
            throw new AuthException("Username already taken");
        if (userRepository.existsByEmail(email) || analystRepository.existsByEmail(email))
            throw new AuthException("Email already registered");

        validatePassword(password);

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setName(name != null && !name.isBlank() ? name : username);
        user.setProvider("LOCAL");
        user.setRoles(List.of("ROLE_USER"));
        user.setStatus("ACTIVE");

        userRepository.save(user);

        try { emailService.sendWelcomeEmail(email, user.getName()); }
        catch (Exception ignored) {}
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    /**
     * POST /api/user/login
     * Issues tokens only if status = ACTIVE.
     */
    public TokenPair login(String username, String password, boolean rememberMe) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AuthException("Invalid username or password"));

        if (user.getPassword() == null)
            throw new AuthException("This account uses Google login. Please sign in with Google.");

        if (!passwordEncoder.matches(password, user.getPassword()))
            throw new AuthException("Invalid username or password");

        if (!"ACTIVE".equals(user.getStatus()))
            throw new AuthException("Your account has been suspended. Contact support.");

        return issueTokens(user, rememberMe);
    }

    // ── Refresh ───────────────────────────────────────────────────────────────

    public TokenPair refresh(String rawToken) {
        RefreshToken stored = refreshTokenRepository.findByToken(rawToken)
                .orElseThrow(() -> new AuthException("Invalid refresh token"));

        if (!"USER".equals(stored.getSubjectType()))
            throw new AuthException("Invalid token for this endpoint");

        if (!stored.isValid()) {
            refreshTokenRepository.revokeAllBySubject("USER", stored.getSubjectId());
            throw new AuthException("Refresh token expired. Please log in again.");
        }

        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        User user = userRepository.findById(stored.getSubjectId())
                .orElseThrow(() -> new AuthException("User not found"));

        return issueTokens(user, stored.isRememberMe());
    }

    // ── Logout ────────────────────────────────────────────────────────────────

    public void logout(String rawToken) {
        refreshTokenRepository.findByToken(rawToken).ifPresent(t -> {
            t.setRevoked(true);
            refreshTokenRepository.save(t);
        });
    }

    // ── Get current user ──────────────────────────────────────────────────────

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AuthException("User not found"));
    }

    // ── Forgot Password ───────────────────────────────────────────────────────

    /**
     * Generates a one-time reset token and emails it.
     * Always returns success even if email not found — prevents user enumeration.
     */
    public void forgotPassword(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            if (!"LOCAL".equalsIgnoreCase(user.getProvider())) return;

            resetTokenRepository.deleteAllByUser(user);

            String token   = UUID.randomUUID().toString();
            Instant expiry = Instant.now().plus(passwordResetMinutes, ChronoUnit.MINUTES);
            resetTokenRepository.save(new PasswordResetToken(token, user, expiry));

            emailService.sendPasswordResetEmail(email, token);
        });
    }

    // ── Reset Password ────────────────────────────────────────────────────────

    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = resetTokenRepository.findByToken(token)
                .orElseThrow(() -> new AuthException("Invalid or expired reset link"));

        if (!resetToken.isValid())
            throw new AuthException("Reset link has expired. Please request a new one.");

        validatePassword(newPassword);

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        resetTokenRepository.save(resetToken);

        refreshTokenRepository.revokeAllBySubject("USER", user.getId());
    }

    // ── Change Password ───────────────────────────────────────────────────────

    public void changePassword(String username, String currentPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AuthException("User not found"));

        if (user.getPassword() == null ||
                !passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new AuthException("Current password is incorrect");
        }

        validatePassword(newPassword);

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        refreshTokenRepository.revokeAllBySubject("USER", user.getId());
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private TokenPair issueTokens(User user, boolean rememberMe) {
        String access = jwtUtil.generateAccessToken(user.getUsername(), "ROLE_USER", "USER");

        int days = rememberMe ? rememberMeDays : refreshDays;
        String rawRefresh = jwtUtil.generateRefreshToken(user.getUsername());
        Instant expiresAt = Instant.now().plus(days, ChronoUnit.DAYS);

        RefreshToken rt = new RefreshToken(rawRefresh, "USER", user.getId(),
                user.getUsername(), expiresAt, rememberMe);
        refreshTokenRepository.save(rt);

        return new TokenPair(access, rawRefresh, user.getUsername(), "ROLE_USER", "USER");
    }

    private void validatePassword(String p) {
        if (p == null || p.length() < 8)
            throw new AuthException("Password must be at least 8 characters");
        if (!p.matches(".*[A-Z].*"))
            throw new AuthException("Password must contain at least one uppercase letter");
        if (!p.matches(".*[0-9].*"))
            throw new AuthException("Password must contain at least one number");
    }

    public record TokenPair(String accessToken, String refreshToken,
                             String username, String role, String userType) {}
}
