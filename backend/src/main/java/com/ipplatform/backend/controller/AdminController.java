package com.ipplatform.backend.controller;

import com.ipplatform.backend.service.AdminService;
import com.ipplatform.backend.service.AdminService.DocumentFile;
import com.ipplatform.backend.service.AdminService.TokenPair;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * ADMIN endpoints — separate from User and Analyst.
 *
 * POST /api/admin/login                      → admin login
 * GET  /api/admin/analysts/pending           → list pending analyst applications
 * GET  /api/admin/analysts/all               → list all analysts (any status)
 * GET  /api/admin/analysts/{id}              → full detail of one analyst
 * GET  /api/admin/analysts/{id}/document     → preview/download identity document
 * POST /api/admin/analysts/{id}/approve      → approve → analyst can login
 * POST /api/admin/analysts/{id}/reject       → reject  → analyst cannot login
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // ── Login (no @PreAuthorize — this IS the auth endpoint) ─────────────────

    /**
     * POST /api/admin/login
     * Content-Type: application/json
     *
     * Request:
     * { "username": "admin", "password": "Admin@123" }
     *
     * Response 200:
     * {
     *   "accessToken":  "eyJ...",
     *   "refreshToken": "eyJ...",
     *   "username":     "admin",
     *   "role":         "ROLE_ADMIN"
     * }
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> req) {
        TokenPair tokens = adminService.login(req.get("username"), req.get("password"));
        return ResponseEntity.ok(Map.of(
                "accessToken",  tokens.accessToken(),
                "refreshToken", tokens.refreshToken(),
                "username",     tokens.username(),
                "role",         tokens.role()
        ));
    }

    // ── All endpoints below require ROLE_ADMIN JWT ────────────────────────────

    /**
     * GET /api/admin/analysts/pending
     * Returns all PENDING analyst applications (awaiting review).
     *
     * Response:
     * [
     *   {
     *     "id": 1, "username": "analyst1", "email": "...", "name": "...",
     *     "status": "PENDING", "createdAt": "...",
     *     "documentType": "AADHAAR_CARD", "documentFileName": "aadhar.jpg",
     *     "documentSizeKB": 120
     *   }
     * ]
     */
    @GetMapping("/analysts/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getPending() {
        return ResponseEntity.ok(adminService.getPendingAnalysts());
    }

    /**
     * GET /api/admin/analysts/all
     * Returns all analysts with any status.
     */
    @GetMapping("/analysts/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAll() {
        return ResponseEntity.ok(adminService.getAllAnalysts());
    }

    /**
     * GET /api/admin/analysts/{id}
     * Full analyst detail including document download URL.
     *
     * Response:
     * {
     *   "id": 1, "username": "analyst1", "email": "...", "name": "...",
     *   "status": "PENDING", "createdAt": "...",
     *   "purpose": "...", "organization": "...",
     *   "documentType": "AADHAAR_CARD", "documentFileName": "aadhar.jpg",
     *   "documentSizeKB": 120, "adminNote": "", "reviewedBy": "", "reviewedAt": "",
     *   "documentDownloadUrl": "/api/admin/analysts/1/document"
     * }
     */
    @GetMapping("/analysts/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getAnalystDetail(id));
    }

    /**
     * GET /api/admin/analysts/{id}/document
     * Streams the identity document bytes from DB.
     * Opens inline in browser (PDF viewer / image viewer).
     * To force download, change ContentDisposition to attachment().
     */
    @GetMapping("/analysts/{id}/document")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> getDocument(@PathVariable Long id) {
        DocumentFile doc = adminService.getDocument(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(doc.contentType()));
        headers.setContentDisposition(
                ContentDisposition.inline().filename(doc.fileName()).build());

        return ResponseEntity.ok().headers(headers).body(doc.bytes());
    }

    /**
     * POST /api/admin/analysts/{id}/approve
     * Content-Type: application/json
     *
     * Request (optional):
     * { "adminNote": "Aadhaar card verified successfully." }
     *
     * Response 200:
     * { "message": "Analyst approved. They can now log in.", "status": "APPROVED" }
     */
    @PostMapping("/analysts/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> approve(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            Principal principal) {

        String note = body != null ? body.getOrDefault("adminNote", "") : "";
        return ResponseEntity.ok(adminService.approve(id, note, principal.getName()));
    }

    /**
     * POST /api/admin/analysts/{id}/reject
     * Content-Type: application/json
     *
     * Request:
     * { "reason": "Document appears invalid or tampered." }
     *
     * Response 200:
     * { "message": "Analyst rejected.", "status": "REJECTED" }
     */
    @PostMapping("/analysts/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> reject(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            Principal principal) {

        String reason = body != null ? body.getOrDefault("reason", "") : "";
        return ResponseEntity.ok(adminService.reject(id, reason, principal.getName()));
    }
}