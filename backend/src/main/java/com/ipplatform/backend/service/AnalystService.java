package com.ipplatform.backend.service;

import com.ipplatform.backend.exception.AuthException;
import com.ipplatform.backend.model.Analyst;
import com.ipplatform.backend.model.Analyst.AnalystStatus;
import com.ipplatform.backend.model.RefreshToken;
import com.ipplatform.backend.repository.AnalystRepository;
import com.ipplatform.backend.repository.RefreshTokenRepository;
import com.ipplatform.backend.repository.UserRepository;
import com.ipplatform.backend.security.JwtUtil;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Handles ANALYST registration and login exclusively.
 *
 * Key rules:
 * 1. Registration = form fields + document file in ONE multipart request
 * 2. After registration status = PENDING — analyst CANNOT login at all
 * 3. Login only succeeds if status = APPROVED
 * 4. No token issued at registration
 */
@Service
@Transactional
public class AnalystService {

    private static final long MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
    private static final List<String> ALLOWED_MIME = List.of(
            MediaType.IMAGE_JPEG_VALUE,
            MediaType.IMAGE_PNG_VALUE,
            "application/pdf"
    );
    private static final List<String> VALID_DOC_TYPES = List.of(
            "AADHAAR_CARD", "PAN_CARD", "PASSPORT",
            "VOTER_ID", "BIRTH_CERTIFICATE", "DRIVING_LICENSE", "OTHER"
    );

    @Value("${auth.refresh-token-expiry-days:7}")
    private int refreshDays;

    @Value("${auth.remember-me-expiry-days:30}")
    private int rememberMeDays;

    private final AnalystRepository      analystRepository;
    private final UserRepository         userRepository;   // to check cross-table username uniqueness
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder        passwordEncoder;
    private final JwtUtil                jwtUtil;

    public AnalystService(AnalystRepository analystRepository,
                          UserRepository userRepository,
                          RefreshTokenRepository refreshTokenRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.analystRepository      = analystRepository;
        this.userRepository         = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder        = passwordEncoder;
        this.jwtUtil                = jwtUtil;
    }

    // ── Register (ONE request — form + document) ──────────────────────────────

    /**
     * POST /api/analyst/register  (multipart/form-data)
     *
     * Creates analyst account with status = PENDING.
     * Document stored in DB as bytea.
     * NO token returned — analyst cannot login until admin approves.
     *
     * @param username     chosen username
     * @param email        email address
     * @param password     min 8 chars, 1 uppercase, 1 number
     * @param name         full name
     * @param documentType AADHAAR_CARD | PAN_CARD | PASSPORT | VOTER_ID |
     *                     BIRTH_CERTIFICATE | DRIVING_LICENSE | OTHER
     * @param purpose      optional — reason for analyst access
     * @param organization optional — company or institution
     * @param document     JPEG / PNG / PDF, max 5MB
     */
    public void register(String username, String email, String password,
                         String name, String documentType,
                         String purpose, String organization,
                         MultipartFile document) throws IOException {

        // ── Username uniqueness across BOTH users and analysts tables ──────────
        if (analystRepository.existsByUsername(username) || userRepository.existsByUsername(username))
            throw new AuthException("Username already taken");

        if (analystRepository.existsByEmail(email) || userRepository.existsByEmail(email))
            throw new AuthException("Email already registered");

        validatePassword(password);

        // ── Validate document type ────────────────────────────────────────────
        String docTypeUpper = documentType.trim().toUpperCase();
        if (!VALID_DOC_TYPES.contains(docTypeUpper))
            throw new AuthException(
                "Invalid documentType: " + documentType +
                ". Allowed: " + String.join(", ", VALID_DOC_TYPES));

        // ── Validate file ─────────────────────────────────────────────────────
        if (document == null || document.isEmpty())
            throw new AuthException("Identity document file is required");

        if (!ALLOWED_MIME.contains(document.getContentType()))
            throw new AuthException(
                "Invalid file type. Only JPEG, PNG, and PDF files are accepted.");

        if (document.getSize() > MAX_FILE_BYTES)
            throw new AuthException(
                "File too large. Maximum allowed size is 5MB.");

        // ── Create analyst record ─────────────────────────────────────────────
        Analyst analyst = new Analyst();
        analyst.setUsername(username);
        analyst.setEmail(email);
        analyst.setPassword(passwordEncoder.encode(password));
        analyst.setName(name != null && !name.isBlank() ? name : username);
        analyst.setPurpose(purpose);
        analyst.setOrganization(organization);
        analyst.setDocumentType(docTypeUpper);
        analyst.setDocumentFileName(document.getOriginalFilename());
        analyst.setDocumentContentType(document.getContentType());
        analyst.setDocumentSizeBytes(document.getSize());
        analyst.setDocumentData(document.getBytes()); // stored as bytea in PostgreSQL
        analyst.setStatus(AnalystStatus.PENDING);     // CANNOT login until APPROVED

        analystRepository.save(analyst);
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    /**
     * POST /api/analyst/login
     *
     * Only succeeds if status = APPROVED.
     * Returns specific error messages for PENDING and REJECTED statuses.
     */
    public TokenPair login(String username, String password, boolean rememberMe) {
        Analyst analyst = analystRepository.findByUsername(username)
                .orElseThrow(() -> new AuthException("Invalid username or password"));

        if (!passwordEncoder.matches(password, analyst.getPassword()))
            throw new AuthException("Invalid username or password");

        // ── Status gate — only APPROVED can login ─────────────────────────────
        switch (analyst.getStatus()) {
            case PENDING ->
                throw new AuthException(
                    "Your application is pending admin approval. " +
                    "You will receive an email once a decision is made.");
            case REJECTED ->
                throw new AuthException(
                    "Your analyst application was rejected. " +
                    "Reason: " + (analyst.getAdminNote() != null ? analyst.getAdminNote() : "N/A") +
                    ". Please contact support.");
            case SUSPENDED ->
                throw new AuthException("Your account has been suspended. Please contact support.");
            case APPROVED -> { /* proceed */ }
        }

        return issueTokens(analyst, rememberMe);
    }

    // ── Refresh ───────────────────────────────────────────────────────────────

    public TokenPair refresh(String rawToken) {
        RefreshToken stored = refreshTokenRepository.findByToken(rawToken)
                .orElseThrow(() -> new AuthException("Invalid refresh token"));

        if (!"ANALYST".equals(stored.getSubjectType()))
            throw new AuthException("Invalid token for this endpoint");

        if (!stored.isValid()) {
            refreshTokenRepository.revokeAllBySubject("ANALYST", stored.getSubjectId());
            throw new AuthException("Refresh token expired. Please log in again.");
        }

        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        Analyst analyst = analystRepository.findById(stored.getSubjectId())
                .orElseThrow(() -> new AuthException("Analyst not found"));

        return issueTokens(analyst, stored.isRememberMe());
    }

    // ── Logout ────────────────────────────────────────────────────────────────

    public void logout(String rawToken) {
        refreshTokenRepository.findByToken(rawToken).ifPresent(t -> {
            t.setRevoked(true);
            refreshTokenRepository.save(t);
        });
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private TokenPair issueTokens(Analyst analyst, boolean rememberMe) {
        String access = jwtUtil.generateAccessToken(
                analyst.getUsername(), "ROLE_ANALYST", "ANALYST");

        int days = rememberMe ? rememberMeDays : refreshDays;
        String rawRefresh = jwtUtil.generateRefreshToken(analyst.getUsername());
        Instant expiresAt = Instant.now().plus(days, ChronoUnit.DAYS);

        RefreshToken rt = new RefreshToken(rawRefresh, "ANALYST", analyst.getId(),
                analyst.getUsername(), expiresAt, rememberMe);
        refreshTokenRepository.save(rt);

        return new TokenPair(access, rawRefresh, analyst.getUsername(), "ROLE_ANALYST", "ANALYST");
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