package com.ipplatform.backend.controller;

import com.ipplatform.backend.service.AnalystApplicationService;
import com.ipplatform.backend.service.AnalystApplicationService.DocumentFile;

import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * Admin endpoints for reviewing analyst applications.
 *
 * ┌──────────────────────────────────────────────────────────────┬────────────────────────────────────────┐
 * │ Endpoint                                                     │ Purpose                                │
 * ├──────────────────────────────────────────────────────────────┼────────────────────────────────────────┤
 * │ GET  /api/admin/analyst-applications                         │ All applications (any status)          │
 * │ GET  /api/admin/analyst-applications/pending                 │ Only SUBMITTED applications            │
 * │ GET  /api/admin/analyst-applications/{id}                    │ Full detail + document list            │
 * │ GET  /api/admin/analyst-applications/{id}/documents/{docId}/download │ Download/preview document │
 * │ POST /api/admin/analyst-applications/{id}/approve            │ Approve → user can login               │
 * │ POST /api/admin/analyst-applications/{id}/reject             │ Reject → user cannot login             │
 * └──────────────────────────────────────────────────────────────┴────────────────────────────────────────┘
 */
@RestController
@RequestMapping("/api/admin/analyst-applications")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAnalystReviewController {

    private final AnalystApplicationService applicationService;

    public AdminAnalystReviewController(AnalystApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    // ── List all applications ─────────────────────────────────────────────────

    /**
     * GET /api/admin/analyst-applications
     * Returns all applications with any status (for admin dashboard overview).
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllApplications() {
        return ResponseEntity.ok(applicationService.getAllApplications());
    }

    // ── List pending (submitted, not yet reviewed) ────────────────────────────

    /**
     * GET /api/admin/analyst-applications/pending
     * Returns only SUBMITTED applications — the review queue.
     *
     * Response: array of:
     * {
     *   "applicationId": 1,
     *   "status": "SUBMITTED",
     *   "submittedAt": "...",
     *   "documentsCount": 2,
     *   "user": { "id": 5, "username": "john", "email": "...", "name": "John Doe" }
     * }
     */
    @GetMapping("/pending")
    public ResponseEntity<List<Map<String, Object>>> getPendingApplications() {
        return ResponseEntity.ok(applicationService.getSubmittedApplications());
    }

    // ── Get full application detail ───────────────────────────────────────────

    /**
     * GET /api/admin/analyst-applications/{id}
     *
     * Returns full application info + list of documents with download URLs.
     * Auto-marks application as UNDER_REVIEW on first access.
     *
     * Response:
     * {
     *   "applicationId": 1,
     *   "status": "UNDER_REVIEW",
     *   "purpose": "...",
     *   "organization": "...",
     *   "user": { ... },
     *   "documents": [
     *     {
     *       "documentId": 1,
     *       "documentType": "AADHAAR_CARD",
     *       "fileName": "aadhaar.jpg",
     *       "contentType": "image/jpeg",
     *       "fileSizeBytes": 204800,
     *       "downloadUrl": "/api/admin/analyst-applications/1/documents/1/download"
     *     }
     *   ]
     * }
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getApplicationDetails(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getApplicationDetails(id));
    }

    // ── Download / preview a document ─────────────────────────────────────────

    /**
     * GET /api/admin/analyst-applications/{id}/documents/{documentId}/download
     *
     * Returns the raw document file bytes.
     * The Content-Disposition header is set to "inline" so images/PDFs
     * render directly in the browser — admin can preview without downloading.
     *
     * To force download instead of preview, change "inline" to "attachment".
     */
    @GetMapping("/{id}/documents/{documentId}/download")
    public ResponseEntity<byte[]> downloadDocument(
            @PathVariable Long id,
            @PathVariable Long documentId) throws IOException {

        DocumentFile docFile = applicationService.getDocumentFile(id, documentId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(docFile.contentType()));

        // "inline" → renders in browser (PDF viewer, image viewer)
        // "attachment" → forces download
        headers.setContentDisposition(
                ContentDisposition.inline()
                        .filename(docFile.fileName())
                        .build()
        );

        return ResponseEntity.ok()
                .headers(headers)
                .body(docFile.bytes());
    }

    // ── Approve ───────────────────────────────────────────────────────────────

    /**
     * POST /api/admin/analyst-applications/{id}/approve
     * Body (optional): { "adminNote": "Verified Aadhaar and PAN successfully." }
     *
     * - Sets application status → APPROVED
     * - Sets user account status → ACTIVE (analyst can now login)
     * - Sends approval email to analyst
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<Map<String, Object>> approve(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            Principal principal) {

        String adminNote = (body != null) ? body.getOrDefault("adminNote", "") : "";

        return ResponseEntity.ok(
                applicationService.approveApplication(id, adminNote, principal.getName()));
    }

    // ── Reject ────────────────────────────────────────────────────────────────

    /**
     * POST /api/admin/analyst-applications/{id}/reject
     * Body: { "reason": "Document appears to be invalid or tampered." }
     *
     * - Sets application status → REJECTED
     * - Sets user account status → REJECTED (cannot login)
     * - Sends rejection email with reason to analyst
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<Map<String, Object>> reject(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Principal principal) {

        String reason = body != null ? body.getOrDefault("reason", "") : "";

        return ResponseEntity.ok(
                applicationService.rejectApplication(id, reason, principal.getName()));
    }
}