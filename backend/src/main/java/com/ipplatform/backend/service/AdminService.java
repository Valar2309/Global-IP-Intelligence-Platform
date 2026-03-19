package com.ipplatform.backend.service;

import com.ipplatform.backend.exception.AuthException;
import com.ipplatform.backend.model.Admin;
import com.ipplatform.backend.model.Analyst;
import com.ipplatform.backend.model.Analyst.AnalystStatus;
import com.ipplatform.backend.model.RefreshToken;
import com.ipplatform.backend.repository.AdminRepository;
import com.ipplatform.backend.repository.AnalystRepository;
import com.ipplatform.backend.repository.RefreshTokenRepository;
import com.ipplatform.backend.security.JwtUtil;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Handles ADMIN login and analyst approval/rejection.
 * Admins cannot self-register — seeded via DataInitializer on startup.
 */
@Service
@Transactional
public class AdminService {

    @Value("${auth.refresh-token-expiry-days:7}")
    private int refreshDays;

    private final AdminRepository        adminRepository;
    private final AnalystRepository      analystRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder        passwordEncoder;
    private final JwtUtil                jwtUtil;

    public AdminService(AdminRepository adminRepository,
                        AnalystRepository analystRepository,
                        RefreshTokenRepository refreshTokenRepository,
                        PasswordEncoder passwordEncoder,
                        JwtUtil jwtUtil) {
        this.adminRepository        = adminRepository;
        this.analystRepository      = analystRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder        = passwordEncoder;
        this.jwtUtil                = jwtUtil;
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    /**
     * POST /api/admin/login
     * Admin credentials are seeded on startup — no registration endpoint.
     */
    public TokenPair login(String username, String password) {
        Admin admin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new AuthException("Invalid admin credentials"));

        if (!passwordEncoder.matches(password, admin.getPassword()))
            throw new AuthException("Invalid admin credentials");

        if (!admin.isActive())
            throw new AuthException("Admin account is disabled");

        String access = jwtUtil.generateAccessToken(
                admin.getUsername(), "ROLE_ADMIN", "ADMIN");

        String rawRefresh = jwtUtil.generateRefreshToken(admin.getUsername());
        Instant expiresAt = Instant.now().plus(refreshDays, ChronoUnit.DAYS);

        RefreshToken rt = new RefreshToken(rawRefresh, "ADMIN", admin.getId(),
                admin.getUsername(), expiresAt, false);
        refreshTokenRepository.save(rt);

        return new TokenPair(access, rawRefresh, admin.getUsername(), "ROLE_ADMIN");
    }

    // ── List pending analysts ─────────────────────────────────────────────────

    /**
     * GET /api/admin/analysts/pending
     * Returns all PENDING analysts with document metadata (no bytes).
     */
    public List<Map<String, Object>> getPendingAnalysts() {
        return analystRepository
                .findByStatusOrderByCreatedAtAsc(AnalystStatus.PENDING)
                .stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    /**
     * GET /api/admin/analysts/all
     * Returns all analysts regardless of status.
     */
    public List<Map<String, Object>> getAllAnalysts() {
        return analystRepository.findAll()
                .stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    // ── Get analyst detail ────────────────────────────────────────────────────

    /**
     * GET /api/admin/analysts/{id}
     * Full detail including document download URL.
     */
    public Map<String, Object> getAnalystDetail(Long id) {
        Analyst analyst = analystRepository.findById(id)
                .orElseThrow(() -> new AuthException("Analyst not found: " + id));

        Map<String, Object> detail = new HashMap<>(toSummary(analyst));
        detail.put("purpose",      analyst.getPurpose()      != null ? analyst.getPurpose()      : "");
        detail.put("organization", analyst.getOrganization() != null ? analyst.getOrganization() : "");
        detail.put("adminNote",    analyst.getAdminNote()    != null ? analyst.getAdminNote()    : "");
        detail.put("reviewedBy",   analyst.getReviewedBy()   != null ? analyst.getReviewedBy()   : "");
        detail.put("reviewedAt",   analyst.getReviewedAt()   != null ? analyst.getReviewedAt().toString() : "");
        detail.put("documentDownloadUrl", "/api/admin/analysts/" + id + "/document");
        return detail;
    }

    // ── Download document ─────────────────────────────────────────────────────

    /**
     * GET /api/admin/analysts/{id}/document
     * Returns raw document bytes from DB for browser preview.
     */
    public DocumentFile getDocument(Long id) {
        Analyst analyst = analystRepository.findById(id)
                .orElseThrow(() -> new AuthException("Analyst not found: " + id));

        return new DocumentFile(
                analyst.getDocumentData(),
                analyst.getDocumentContentType(),
                analyst.getDocumentFileName()
        );
    }

    // ── Approve ───────────────────────────────────────────────────────────────

    /**
     * POST /api/admin/analysts/{id}/approve
     * Sets status = APPROVED → analyst can now login.
     */
    public Map<String, Object> approve(Long id, String adminNote, String adminUsername) {
        Analyst analyst = analystRepository.findById(id)
                .orElseThrow(() -> new AuthException("Analyst not found: " + id));

        if (analyst.getStatus() == AnalystStatus.APPROVED)
            throw new AuthException("Already approved");

        analyst.setStatus(AnalystStatus.APPROVED);
        analyst.setAdminNote(adminNote);
        analyst.setReviewedBy(adminUsername);
        analyst.setReviewedAt(Instant.now());
        analystRepository.save(analyst);

        return Map.of(
                "message",  "Analyst approved. They can now log in.",
                "id",       analyst.getId(),
                "username", analyst.getUsername(),
                "status",   analyst.getStatus().name()
        );
    }

    // ── Reject ────────────────────────────────────────────────────────────────

    /**
     * POST /api/admin/analysts/{id}/reject
     * Sets status = REJECTED → analyst cannot login.
     */
    public Map<String, Object> reject(Long id, String reason, String adminUsername) {
        Analyst analyst = analystRepository.findById(id)
                .orElseThrow(() -> new AuthException("Analyst not found: " + id));

        if (analyst.getStatus() == AnalystStatus.APPROVED)
            throw new AuthException("Cannot reject an already approved analyst");

        analyst.setStatus(AnalystStatus.REJECTED);
        analyst.setAdminNote(reason != null ? reason : "Does not meet requirements");
        analyst.setReviewedBy(adminUsername);
        analyst.setReviewedAt(Instant.now());
        analystRepository.save(analyst);

        return Map.of(
                "message",  "Analyst rejected.",
                "id",       analyst.getId(),
                "username", analyst.getUsername(),
                "status",   analyst.getStatus().name()
        );
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Map<String, Object> toSummary(Analyst a) {
        Map<String, Object> m = new HashMap<>();
        m.put("id",               a.getId());
        m.put("username",         a.getUsername());
        m.put("email",            a.getEmail());
        m.put("name",             a.getName()  != null ? a.getName()  : "");
        m.put("status",           a.getStatus().name());
        m.put("createdAt",        a.getCreatedAt().toString());
        m.put("documentType",     a.getDocumentType());
        m.put("documentFileName", a.getDocumentFileName());
        m.put("documentSizeKB",   a.getDocumentSizeBytes() / 1024);
        return m;
    }

    public record TokenPair(String accessToken, String refreshToken,
                             String username, String role) {}

    public record DocumentFile(byte[] bytes, String contentType, String fileName) {}
}