package com.ipplatform.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Stores analyst identity documents directly in PostgreSQL as binary (bytea).
 *
 * Why DB storage over file system:
 *  ✅ No file system to manage on Supabase
 *  ✅ Documents backed up automatically with DB
 *  ✅ No path/permission issues on deployment
 *  ✅ Simpler — no DocumentStorageService needed
 *
 * Max file size: 5MB (enforced in application.properties + uploadDocument())
 * Allowed types: JPEG, PNG, PDF only
 */
@Entity
@Table(name = "analyst_documents")
public class AnalystDocument {

    public enum DocumentType {
        AADHAAR_CARD,
        PAN_CARD,
        PASSPORT,
        VOTER_ID,
        BIRTH_CERTIFICATE,
        DRIVING_LICENSE,
        OTHER
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private AnalystApplication application;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentType documentType;

    /** Original filename uploaded by the user e.g. "aadhaar_front.jpg" */
    @Column(nullable = false)
    private String originalFileName;

    /**
     * Actual file bytes stored in PostgreSQL bytea column.
     * FetchType.LAZY means the bytes are NOT loaded unless explicitly accessed —
     * this prevents loading 5MB blobs when listing documents.
     */
    @Basic(fetch = FetchType.LAZY)
    @Lob
    @Column(nullable = false, columnDefinition = "bytea")
    private byte[] fileData;

    /** MIME type: "image/jpeg", "image/png", "application/pdf" */
    @Column(nullable = false)
    private String contentType;

    /**
     * File size stored separately so we can display it in listings
     * without loading the full fileData blob.
     */
    @Column(nullable = false)
    private Long fileSizeBytes;

    @Column(nullable = false)
    private Instant uploadedAt = Instant.now();

    // ── Constructors ──────────────────────────────────────────────────────────

    public AnalystDocument() {}

    public AnalystDocument(AnalystApplication application,
                           DocumentType documentType,
                           String originalFileName,
                           byte[] fileData,
                           String contentType,
                           Long fileSizeBytes) {
        this.application      = application;
        this.documentType     = documentType;
        this.originalFileName = originalFileName;
        this.fileData         = fileData;
        this.contentType      = contentType;
        this.fileSizeBytes    = fileSizeBytes;
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }

    public AnalystApplication getApplication() { return application; }
    public void setApplication(AnalystApplication app) { this.application = app; }

    public DocumentType getDocumentType() { return documentType; }
    public void setDocumentType(DocumentType t) { this.documentType = t; }

    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String n) { this.originalFileName = n; }

    public byte[] getFileData() { return fileData; }
    public void setFileData(byte[] data) { this.fileData = data; }

    public String getContentType() { return contentType; }
    public void setContentType(String ct) { this.contentType = ct; }

    public Long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(Long s) { this.fileSizeBytes = s; }

    public Instant getUploadedAt() { return uploadedAt; }
}