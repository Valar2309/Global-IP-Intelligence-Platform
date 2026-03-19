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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@Transactional
public class AnalystService {

    private static final long MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

    private static final List<String> VALID_DOC_TYPES = List.of(
            "AADHAAR_CARD", "PAN_CARD", "PASSPORT",
            "VOTER_ID", "BIRTH_CERTIFICATE", "DRIVING_LICENSE", "OTHER"
    );

    @Value("${auth.refresh-token-expiry-days:7}")
    private int refreshDays;

    @Value("${auth.remember-me-expiry-days:30}")
    private int rememberMeDays;

    private final AnalystRepository analystRepository;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AnalystService(AnalystRepository analystRepository,
                          UserRepository userRepository,
                          RefreshTokenRepository refreshTokenRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.analystRepository = analystRepository;
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // ───────────────── REGISTER ─────────────────

    public void register(String username, String email, String password,
                         String name, String documentType,
                         String purpose, String organization,
                         MultipartFile document) throws IOException {

        // Username uniqueness
        if (analystRepository.existsByUsername(username) ||
            userRepository.existsByUsername(username))
            throw new AuthException("Username already taken");

        // Email uniqueness
        if (analystRepository.existsByEmail(email) ||
            userRepository.existsByEmail(email))
            throw new AuthException("Email already registered");

        validatePassword(password);

        // Validate documentType
        String docTypeUpper = documentType.trim().toUpperCase();
        if (!VALID_DOC_TYPES.contains(docTypeUpper))
            throw new AuthException(
                    "Invalid documentType. Allowed: " + String.join(", ", VALID_DOC_TYPES)
            );

        // Validate file presence
        if (document == null)
            throw new AuthException("Document file is required");

        if (document.isEmpty())
            throw new AuthException("Uploaded document file is empty");

        // Validate file size
        if (document.getSize() > MAX_FILE_BYTES)
            throw new AuthException("File too large. Maximum allowed size is 5MB");

        // Validate file extension (more reliable than MIME)
        String filename = document.getOriginalFilename();
        if (filename == null)
            throw new AuthException("Invalid file name");

        String lower = filename.toLowerCase();

        if (!(lower.endsWith(".jpg") ||
              lower.endsWith(".jpeg") ||
              lower.endsWith(".png") ||
              lower.endsWith(".pdf"))) {

            throw new AuthException(
                    "Invalid file type. Only JPG, JPEG, PNG, and PDF files are allowed"
            );
        }

        // Create Analyst entity
        Analyst analyst = new Analyst();
        analyst.setUsername(username);
        analyst.setEmail(email);
        analyst.setPassword(passwordEncoder.encode(password));
        analyst.setName(name != null && !name.isBlank() ? name : username);
        analyst.setPurpose(purpose);
        analyst.setOrganization(organization);
        analyst.setDocumentType(docTypeUpper);
        analyst.setDocumentFileName(filename);
        analyst.setDocumentContentType(document.getContentType());
        analyst.setDocumentSizeBytes(document.getSize());
        analyst.setDocumentData(document.getBytes());
        analyst.setStatus(AnalystStatus.PENDING);

        analystRepository.save(analyst);
    }

    // ───────────────── LOGIN ─────────────────

    public TokenPair login(String username, String password, boolean rememberMe) {

        Analyst analyst = analystRepository.findByUsername(username)
                .orElseThrow(() -> new AuthException("Invalid username or password"));

        if (!passwordEncoder.matches(password, analyst.getPassword()))
            throw new AuthException("Invalid username or password");

        switch (analyst.getStatus()) {
            case PENDING ->
                    throw new AuthException("Your application is pending admin approval.");
            case REJECTED ->
                    throw new AuthException("Your analyst application was rejected.");
            case SUSPENDED ->
                    throw new AuthException("Your account has been suspended.");
            case APPROVED -> { }
        }

        return issueTokens(analyst, rememberMe);
    }

    // ───────────────── REFRESH ─────────────────

    public TokenPair refresh(String rawToken) {

        RefreshToken stored = refreshTokenRepository.findByToken(rawToken)
                .orElseThrow(() -> new AuthException("Invalid refresh token"));

        if (!stored.isValid())
            throw new AuthException("Refresh token expired. Please log in again.");

        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        Analyst analyst = analystRepository.findById(stored.getSubjectId())
                .orElseThrow(() -> new AuthException("Analyst not found"));

        return issueTokens(analyst, stored.isRememberMe());
    }

    // ───────────────── LOGOUT ─────────────────

    public void logout(String rawToken) {
        refreshTokenRepository.findByToken(rawToken).ifPresent(t -> {
            t.setRevoked(true);
            refreshTokenRepository.save(t);
        });
    }

    // ───────────────── PRIVATE HELPERS ─────────────────

    private TokenPair issueTokens(Analyst analyst, boolean rememberMe) {

        String access = jwtUtil.generateAccessToken(
                analyst.getUsername(), "ROLE_ANALYST", "ANALYST");

        int days = rememberMe ? rememberMeDays : refreshDays;
        String rawRefresh = jwtUtil.generateRefreshToken(analyst.getUsername());
        Instant expiresAt = Instant.now().plus(days, ChronoUnit.DAYS);

        RefreshToken rt = new RefreshToken(
                rawRefresh, "ANALYST", analyst.getId(),
                analyst.getUsername(), expiresAt, rememberMe
        );

        refreshTokenRepository.save(rt);

        return new TokenPair(access, rawRefresh,
                analyst.getUsername(), "ROLE_ANALYST", "ANALYST");
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