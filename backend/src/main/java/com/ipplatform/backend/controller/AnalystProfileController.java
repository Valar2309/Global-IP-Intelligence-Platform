package com.ipplatform.backend.controller;

import com.ipplatform.backend.exception.AuthException;
import com.ipplatform.backend.model.Analyst;
import com.ipplatform.backend.repository.AnalystRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

/**
 * Analyst profile update endpoints.
 *
 * GET  /api/analyst/profile   → get full profile
 * PUT  /api/analyst/profile   → update name, email, organization, purpose
 *
 * All endpoints require a valid ROLE_ANALYST JWT.
 *
 * NOTE: username, password, documentType and document cannot be changed here.
 *       Password change is handled via a separate endpoint if needed.
 *       Document re-submission would require a new registration / re-approval flow.
 */
@RestController
@RequestMapping("/api/analyst")
@PreAuthorize("hasRole('ANALYST')")
public class AnalystProfileController {

    private final AnalystRepository analystRepository;

    public AnalystProfileController(AnalystRepository analystRepository) {
        this.analystRepository = analystRepository;
    }

    // ── GET /api/analyst/profile ──────────────────────────────────────────────

    /**
     * GET /api/analyst/profile
     * Returns the current analyst's full profile.
     *
     * Response 200:
     * {
     *   "id":           1,
     *   "username":     "analyst1",
     *   "email":        "analyst@example.com",
     *   "name":         "Jane Doe",
     *   "organization": "Acme Corp",
     *   "purpose":      "Market research",
     *   "documentType": "PASSPORT",
     *   "status":       "APPROVED",
     *   "createdAt":    "2024-01-01T00:00:00Z"
     * }
     */
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(Principal principal) {
        Analyst analyst = getAnalyst(principal.getName());

        Map<String, Object> resp = new HashMap<>();
        resp.put("id",           analyst.getId());
        resp.put("username",     analyst.getUsername());
        resp.put("email",        analyst.getEmail()        != null ? analyst.getEmail()        : "");
        resp.put("name",         analyst.getName()         != null ? analyst.getName()         : "");
        resp.put("organization", analyst.getOrganization() != null ? analyst.getOrganization() : "");
        resp.put("purpose",      analyst.getPurpose()      != null ? analyst.getPurpose()      : "");
        resp.put("documentType", analyst.getDocumentType());
        resp.put("status",       analyst.getStatus().name());
        resp.put("createdAt",    analyst.getCreatedAt().toString());

        return ResponseEntity.ok(resp);
    }

    // ── PUT /api/analyst/profile ──────────────────────────────────────────────

    /**
     * PUT /api/analyst/profile
     * Updates the current analyst's editable profile fields.
     * All fields are optional — only provided (non-blank) fields are updated.
     *
     * Request:
     * {
     *   "name":         "Jane Smith",           (optional)
     *   "email":        "jane@newdomain.com",   (optional)
     *   "organization": "New Corp",             (optional)
     *   "purpose":      "IP portfolio analysis" (optional)
     * }
     *
     * Response 200:
     * {
     *   "message":      "Profile updated successfully.",
     *   "id":           1,
     *   "username":     "analyst1",
     *   "name":         "Jane Smith",
     *   "email":        "jane@newdomain.com",
     *   "organization": "New Corp",
     *   "purpose":      "IP portfolio analysis"
     * }
     *
     * Error 400:
     * { "error": "Email already registered" }
     */
    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestBody Map<String, String> req,
            Principal principal) {

        Analyst analyst = getAnalyst(principal.getName());

        // Update name if provided
        String newName = req.get("name");
        if (newName != null && !newName.isBlank()) {
            analyst.setName(newName.trim());
        }

        // Update email if provided and different
        String newEmail = req.get("email");
        if (newEmail != null && !newEmail.isBlank()) {
            String trimmed = newEmail.trim().toLowerCase();
            if (!trimmed.equals(analyst.getEmail())) {
                if (analystRepository.existsByEmail(trimmed)) {
                    throw new AuthException("Email already registered");
                }
                analyst.setEmail(trimmed);
            }
        }

        // Update organization if provided
        String newOrg = req.get("organization");
        if (newOrg != null && !newOrg.isBlank()) {
            analyst.setOrganization(newOrg.trim());
        }

        // Update purpose if provided (allow clearing with explicit empty string? No — keep blank check)
        String newPurpose = req.get("purpose");
        if (newPurpose != null && !newPurpose.isBlank()) {
            analyst.setPurpose(newPurpose.trim());
        }

        analystRepository.save(analyst);

        Map<String, Object> resp = new HashMap<>();
        resp.put("message",      "Profile updated successfully.");
        resp.put("id",           analyst.getId());
        resp.put("username",     analyst.getUsername());
        resp.put("name",         analyst.getName()         != null ? analyst.getName()         : "");
        resp.put("email",        analyst.getEmail()        != null ? analyst.getEmail()        : "");
        resp.put("organization", analyst.getOrganization() != null ? analyst.getOrganization() : "");
        resp.put("purpose",      analyst.getPurpose()      != null ? analyst.getPurpose()      : "");

        return ResponseEntity.ok(resp);
    }

    // ── Private helper ────────────────────────────────────────────────────────

    private Analyst getAnalyst(String username) {
        return analystRepository.findByUsername(username)
                .orElseThrow(() -> new AuthException("Analyst not found"));
    }
}