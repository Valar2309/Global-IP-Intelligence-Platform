package com.ipplatform.backend.service;

import com.ipplatform.backend.exception.AuthException;
import com.ipplatform.backend.model.*;
import com.ipplatform.backend.model.AnalystApplication.ApplicationStatus;
import com.ipplatform.backend.model.User.AccountStatus;
import com.ipplatform.backend.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Analyst document verification workflow.
 * Documents stored directly in PostgreSQL as bytea — no file system needed.
 */
@Service
@Transactional
public class AnalystApplicationService {

    private static final long         MAX_FILE_SIZE  = 5 * 1024 * 1024; // 5 MB
    private static final List<String> ALLOWED_TYPES  = List.of(
            "image/jpeg", "image/png", "application/pdf"
    );

    private final AnalystApplicationRepository applicationRepository;
    private final AnalystDocumentRepository    documentRepository;
    private final UserRepository               userRepository;
    private final EmailService                 emailService;

    public AnalystApplicationService(
            AnalystApplicationRepository applicationRepository,
            AnalystDocumentRepository documentRepository,
            UserRepository userRepository,
            EmailService emailService) {
        this.applicationRepository = applicationRepository;
        this.documentRepository    = documentRepository;
        this.userRepository        = userRepository;
        this.emailService          = emailService;
    }

    // ── Called by AuthService on analyst registration ─────────────────────────

    public AnalystApplication createApplicationForUser(User user) {
        return applicationRepository.save(new AnalystApplication(user));
    }

    // ── ANALYST: save optional details ───────────────────────────────────────

    public Map<String, Object> saveApplicationDetails(String username,
                                                       String purpose,
                                                       String organization) {
        AnalystApplication app = getApplicationByUsername(username);
        guardNotSubmitted(app);
        app.setPurpose(purpose);
        app.setOrganization(organization);
        applicationRepository.save(app);
        return buildApplicationSummary(app);
    }

    // ── ANALYST: upload document → stored in DB as bytea ─────────────────────

    /**
     * Reads the multipart file bytes and persists them directly in the
     * analyst_documents table (bytea column). No file system involved.
     *
     * @param documentType  AADHAAR_CARD | PAN_CARD | PASSPORT | VOTER_ID |
     *                      BIRTH_CERTIFICATE | DRIVING_LICENSE | OTHER
     * @param file          JPEG / PNG / PDF, max 5 MB
     */
    public Map<String, Object> uploadDocument(String username,
                                               String documentType,
                                               MultipartFile file) throws IOException {
        AnalystApplication app = getApplicationByUsername(username);
        guardNotSubmitted(app);

        // Validate document type
        AnalystDocument.DocumentType docType;
        try {
            docType = AnalystDocument.DocumentType.valueOf(documentType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new AuthException(
                "Invalid document type: " + documentType +
                ". Allowed: AADHAAR_CARD, PAN_CARD, PASSPORT, VOTER_ID, " +
                "BIRTH_CERTIFICATE, DRIVING_LICENSE, OTHER");
        }

        // Validate file
        if (file == null || file.isEmpty()) {
            throw new AuthException("File must not be empty");
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new AuthException(
                "Invalid file type: " + file.getContentType() +
                ". Only JPEG, PNG, and PDF files are accepted.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new AuthException(
                "File too large. Max allowed: 5MB. " +
                "Your file: " + (file.getSize() / 1024 / 1024) + "MB");
        }

        // Read bytes and save to DB
        byte[] bytes = file.getBytes();

        AnalystDocument doc = new AnalystDocument(
                app,
                docType,
                file.getOriginalFilename(),
                bytes,
                file.getContentType(),
                file.getSize()
        );
        documentRepository.save(doc);

        return Map.of(
                "documentId",   doc.getId(),
                "documentType", doc.getDocumentType().name(),
                "fileName",     doc.getOriginalFileName(),
                "fileSizeKB",   file.getSize() / 1024,
                "uploadedAt",   doc.getUploadedAt().toString(),
                "message",      "Document uploaded and saved to database successfully"
        );
    }

    // ── ANALYST: delete a document before submission ──────────────────────────

    public Map<String, Object> deleteDocument(String username, Long documentId) {
        AnalystApplication app = getApplicationByUsername(username);
        guardNotSubmitted(app);

        AnalystDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new AuthException("Document not found"));

        if (!doc.getApplication().getId().equals(app.getId())) {
            throw new AuthException("Document does not belong to your application");
        }

        documentRepository.delete(doc);
        return Map.of("message", "Document deleted successfully");
    }

    // ── ANALYST: final submit ─────────────────────────────────────────────────

    public Map<String, Object> submitApplication(String username) {
        AnalystApplication app = getApplicationByUsername(username);

        if (app.getStatus() != ApplicationStatus.AWAITING_DOCUMENTS) {
            throw new AuthException("Application already submitted or processed.");
        }

        List<AnalystDocument> docs = documentRepository.findByApplicationId(app.getId());
        if (docs.isEmpty()) {
            throw new AuthException(
                "Please upload at least one identity document before submitting.");
        }

        app.setStatus(ApplicationStatus.SUBMITTED);
        app.setSubmittedAt(Instant.now());
        applicationRepository.save(app);

        User user = app.getUser();
        user.setAccountStatus(AccountStatus.PENDING_REVIEW);
        userRepository.save(user);

        try {
            emailService.sendAnalystApplicationSubmittedEmail(user.getEmail(), user.getName());
        } catch (Exception ignored) {}

        return Map.of(
                "message",        "Application submitted. You will be notified once reviewed.",
                "applicationId",  app.getId(),
                "status",         app.getStatus().name(),
                "documentsCount", docs.size()
        );
    }

    // ── ANALYST: get own status ───────────────────────────────────────────────

    public Map<String, Object> getMyApplicationStatus(String username) {
        return buildApplicationSummary(getApplicationByUsername(username));
    }

    // ── ADMIN: list submitted (review queue) ──────────────────────────────────

    public List<Map<String, Object>> getSubmittedApplications() {
        return applicationRepository
                .findByStatusOrderByCreatedAtAsc(ApplicationStatus.SUBMITTED)
                .stream().map(this::buildAdminSummary).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getAllApplications() {
        return applicationRepository.findAll()
                .stream().map(this::buildAdminSummary).collect(Collectors.toList());
    }

    // ── ADMIN: full detail + document metadata ────────────────────────────────

    public Map<String, Object> getApplicationDetails(Long applicationId) {
        AnalystApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AuthException("Application not found: " + applicationId));

        // Auto-mark as under review on first open
        if (app.getStatus() == ApplicationStatus.SUBMITTED) {
            app.setStatus(ApplicationStatus.UNDER_REVIEW);
            applicationRepository.save(app);
        }

        List<AnalystDocument> docs = documentRepository.findByApplicationId(app.getId());

        List<Map<String, Object>> docList = docs.stream()
                .map(d -> Map.<String, Object>of(
                        "documentId",   d.getId(),
                        "documentType", d.getDocumentType().name(),
                        "fileName",     d.getOriginalFileName(),
                        "contentType",  d.getContentType(),
                        "fileSizeKB",   d.getFileSizeBytes() / 1024,
                        "uploadedAt",   d.getUploadedAt().toString(),
                        // Admin hits this URL to preview/download the document
                        "previewUrl",   "/api/admin/analyst-applications/"
                                        + applicationId + "/documents/" + d.getId() + "/view"
                ))
                .collect(Collectors.toList());

        return Map.of(
                "applicationId", app.getId(),
                "status",        app.getStatus().name(),
                "submittedAt",   app.getSubmittedAt() != null ? app.getSubmittedAt().toString() : "",
                "createdAt",     app.getCreatedAt().toString(),
                "purpose",       app.getPurpose()      != null ? app.getPurpose()      : "",
                "organization",  app.getOrganization() != null ? app.getOrganization() : "",
                "adminNote",     app.getAdminNote()    != null ? app.getAdminNote()    : "",
                "user", Map.of(
                        "id",       app.getUser().getId(),
                        "username", app.getUser().getUsername(),
                        "email",    app.getUser().getEmail() != null ? app.getUser().getEmail() : "",
                        "name",     app.getUser().getName()  != null ? app.getUser().getName()  : ""
                ),
                "documents", docList
        );
    }

    // ── ADMIN: serve document bytes from DB ───────────────────────────────────

    /**
     * Fetches raw file bytes from the DB.
     * Called by AdminAnalystReviewController to stream the document to the browser.
     * Admin can preview PDFs and images inline without downloading.
     */
    public DocumentFile getDocumentFile(Long applicationId, Long documentId) {
        applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AuthException("Application not found"));

        AnalystDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new AuthException("Document not found"));

        if (!doc.getApplication().getId().equals(applicationId)) {
            throw new AuthException("Document does not belong to this application");
        }

        return new DocumentFile(doc.getFileData(), doc.getContentType(), doc.getOriginalFileName());
    }

    // ── ADMIN: approve ────────────────────────────────────────────────────────

    public Map<String, Object> approveApplication(Long applicationId,
                                                   String adminNote,
                                                   String adminUsername) {
        AnalystApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AuthException("Application not found: " + applicationId));

        if (app.getStatus() == ApplicationStatus.APPROVED)
            throw new AuthException("Already approved.");
        if (app.getStatus() == ApplicationStatus.AWAITING_DOCUMENTS)
            throw new AuthException("Analyst has not submitted documents yet.");

        app.setStatus(ApplicationStatus.APPROVED);
        app.setAdminNote(adminNote);
        app.setReviewedBy(adminUsername);
        app.setReviewedAt(Instant.now());
        applicationRepository.save(app);

        User user = app.getUser();
        user.setAccountStatus(AccountStatus.ACTIVE);
        userRepository.save(user);

        try { emailService.sendAnalystApprovedEmail(user.getEmail(), user.getName()); }
        catch (Exception ignored) {}

        return Map.of(
                "message",  "Approved. Analyst can now log in.",
                "username", user.getUsername(),
                "status",   app.getStatus().name()
        );
    }

    // ── ADMIN: reject ─────────────────────────────────────────────────────────

    public Map<String, Object> rejectApplication(Long applicationId,
                                                  String reason,
                                                  String adminUsername) {
        AnalystApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AuthException("Application not found: " + applicationId));

        if (app.getStatus() == ApplicationStatus.APPROVED)
            throw new AuthException("Cannot reject an approved application.");
        if (app.getStatus() == ApplicationStatus.AWAITING_DOCUMENTS)
            throw new AuthException("Analyst has not submitted documents yet.");

        app.setStatus(ApplicationStatus.REJECTED);
        app.setAdminNote(reason);
        app.setReviewedBy(adminUsername);
        app.setReviewedAt(Instant.now());
        applicationRepository.save(app);

        User user = app.getUser();
        user.setAccountStatus(AccountStatus.REJECTED);
        userRepository.save(user);

        String rejectionReason = (reason != null && !reason.isBlank())
                ? reason : "Your application did not meet our requirements.";

        try {
            emailService.sendAnalystRejectedEmail(user.getEmail(), user.getName(), rejectionReason);
        } catch (Exception ignored) {}

        return Map.of(
                "message",  "Application rejected.",
                "username", user.getUsername(),
                "status",   app.getStatus().name()
        );
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private AnalystApplication getApplicationByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AuthException("User not found"));
        return applicationRepository.findByUser(user)
                .orElseThrow(() -> new AuthException(
                        "No analyst application found for: " + username));
    }

    private void guardNotSubmitted(AnalystApplication app) {
        if (app.getStatus() == ApplicationStatus.SUBMITTED  ||
            app.getStatus() == ApplicationStatus.UNDER_REVIEW ||
            app.getStatus() == ApplicationStatus.APPROVED) {
            throw new AuthException("Application already submitted and cannot be modified.");
        }
    }

    private Map<String, Object> buildApplicationSummary(AnalystApplication app) {
        List<AnalystDocument> docs = documentRepository.findByApplicationId(app.getId());
        return Map.of(
                "applicationId", app.getId(),
                "status",        app.getStatus().name(),
                "purpose",       app.getPurpose()      != null ? app.getPurpose()      : "",
                "organization",  app.getOrganization() != null ? app.getOrganization() : "",
                "submittedAt",   app.getSubmittedAt()  != null ? app.getSubmittedAt().toString() : "",
                "adminNote",     app.getAdminNote()    != null ? app.getAdminNote()    : "",
                "documents", docs.stream().map(d -> Map.<String, Object>of(
                        "documentId",   d.getId(),
                        "documentType", d.getDocumentType().name(),
                        "fileName",     d.getOriginalFileName(),
                        "fileSizeKB",   d.getFileSizeBytes() / 1024,
                        "uploadedAt",   d.getUploadedAt().toString()
                )).collect(Collectors.toList())
        );
    }

    private Map<String, Object> buildAdminSummary(AnalystApplication app) {
        long docCount = documentRepository.findByApplicationId(app.getId()).size();
        return Map.of(
                "applicationId",  app.getId(),
                "status",         app.getStatus().name(),
                "submittedAt",    app.getSubmittedAt() != null ? app.getSubmittedAt().toString() : "",
                "createdAt",      app.getCreatedAt().toString(),
                "documentsCount", docCount,
                "user", Map.of(
                        "id",       app.getUser().getId(),
                        "username", app.getUser().getUsername(),
                        "email",    app.getUser().getEmail() != null ? app.getUser().getEmail() : "",
                        "name",     app.getUser().getName()  != null ? app.getUser().getName()  : ""
                )
        );
    }

    public record DocumentFile(byte[] bytes, String contentType, String fileName) {}
}