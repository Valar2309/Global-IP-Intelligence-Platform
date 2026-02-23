package com.ipplatform.backend.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents an analyst's registration request.
 *
 * Lifecycle:
 *   User submits registration with role=ANALYST
 *     → User account created with status=PENDING_DOCUMENT
 *     → AnalystApplication created with status=AWAITING_DOCUMENTS
 *
 *   User uploads identity documents
 *     → AnalystApplication status → SUBMITTED
 *     → User account status → PENDING_REVIEW
 *
 *   Admin reviews documents
 *     → APPROVED → User account status → ACTIVE  → can login
 *     → REJECTED → User account status → REJECTED → cannot login
 */
@Entity
@Table(name = "analyst_applications")
public class AnalystApplication {

    public enum ApplicationStatus {
        AWAITING_DOCUMENTS,  // registered but not yet submitted documents
        SUBMITTED,           // documents uploaded, waiting for admin review
        UNDER_REVIEW,        // admin opened the application
        APPROVED,            // admin approved → user can login
        REJECTED             // admin rejected → user cannot login
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The user account associated with this application. One-to-one. */
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status = ApplicationStatus.AWAITING_DOCUMENTS;

    /** Short description / reason why they want analyst access (optional). */
    @Column(length = 1000)
    private String purpose;

    /** Organization or company name (optional). */
    @Column
    private String organization;

    /** Admin's note when approving or rejecting. */
    @Column(length = 1000)
    private String adminNote;

    /** Which admin processed this application. */
    @Column
    private String reviewedBy;

    @Column
    private Instant submittedAt;

    @Column
    private Instant reviewedAt;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    /** Documents attached to this application. */
    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AnalystDocument> documents = new ArrayList<>();

    // ── Constructors ──────────────────────────────────────────────────────────

    public AnalystApplication() {}

    public AnalystApplication(User user) {
        this.user = user;
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public String getOrganization() { return organization; }
    public void setOrganization(String organization) { this.organization = organization; }

    public String getAdminNote() { return adminNote; }
    public void setAdminNote(String adminNote) { this.adminNote = adminNote; }

    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }

    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }

    public Instant getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }

    public Instant getCreatedAt() { return createdAt; }

    public List<AnalystDocument> getDocuments() { return documents; }
}