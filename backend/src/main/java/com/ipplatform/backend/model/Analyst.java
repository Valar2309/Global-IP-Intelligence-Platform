package com.ipplatform.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Represents an ANALYST account — completely separate from the users table.
 *
 * Lifecycle:
 *   POST /api/analyst/register (multipart — form + document in ONE request)
 *     → status = PENDING
 *     → analyst CANNOT login at all until admin approves
 *
 *   Admin: POST /api/admin/analysts/{id}/approve
 *     → status = APPROVED
 *     → analyst CAN now login via POST /api/analyst/login
 *
 *   Admin: POST /api/admin/analysts/{id}/reject
 *     → status = REJECTED
 *     → analyst cannot login
 *
 * Table: analysts
 */
@Entity
@Table(name = "analysts")
public class Analyst {

    public enum AnalystStatus {
        PENDING,   // registered, waiting for admin approval
        APPROVED,  // admin approved — can login
        REJECTED,  // admin rejected — cannot login
        SUSPENDED  // admin suspended — cannot login
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, nullable = false)
    private String email;

    @Column
    private String name;

    @Column
    private String organization;

    @Column(length = 1000)
    private String purpose;

    // ── Identity Document (stored in DB as bytea) ─────────────────────────────

    @Column(nullable = false)
    private String documentType; // AADHAAR_CARD | PAN_CARD | PASSPORT | VOTER_ID | BIRTH_CERTIFICATE | DRIVING_LICENSE | OTHER

    @Column(nullable = false)
    private String documentFileName;

    @Column(nullable = false)
    private String documentContentType; // image/jpeg | image/png | application/pdf

    @Column(nullable = false)
    private Long documentSizeBytes;

    /**
     * Actual document bytes stored in PostgreSQL (bytea).
     * LAZY fetch — bytes not loaded unless explicitly needed (e.g. admin download).
     *
     * NOTE: Do NOT use @Lob here — Hibernate 6 maps @Lob byte[] to OID (bigint)
     * which conflicts with PostgreSQL bytea columns.
     */
    @Basic(fetch = FetchType.LAZY)
    @Column(nullable = false, columnDefinition = "bytea")
    private byte[] documentData;

    // ── Status & Audit ────────────────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar(20) default 'PENDING'")
    private AnalystStatus status = AnalystStatus.PENDING;

    @Column
    private String adminNote;      // reason for approval or rejection

    @Column
    private String reviewedBy;    // admin username who acted

    @Column
    private Instant reviewedAt;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    // ── Constructors ──────────────────────────────────────────────────────────
    public Analyst() {}

    // ── Getters & Setters ─────────────────────────────────────────────────────
    public Long getId() { return id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getOrganization() { return organization; }
    public void setOrganization(String org) { this.organization = org; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }

    public String getDocumentFileName() { return documentFileName; }
    public void setDocumentFileName(String documentFileName) { this.documentFileName = documentFileName; }

    public String getDocumentContentType() { return documentContentType; }
    public void setDocumentContentType(String documentContentType) { this.documentContentType = documentContentType; }

    public Long getDocumentSizeBytes() { return documentSizeBytes; }
    public void setDocumentSizeBytes(Long documentSizeBytes) { this.documentSizeBytes = documentSizeBytes; }

    public byte[] getDocumentData() { return documentData; }
    public void setDocumentData(byte[] documentData) { this.documentData = documentData; }

    public AnalystStatus getStatus() { return status; }
    public void setStatus(AnalystStatus status) { this.status = status; }

    public String getAdminNote() { return adminNote; }
    public void setAdminNote(String adminNote) { this.adminNote = adminNote; }

    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }

    public Instant getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }

    public Instant getCreatedAt() { return createdAt; }

    // ── Helper ────────────────────────────────────────────────────────────────
    public boolean isApproved() { return status == AnalystStatus.APPROVED; }
}