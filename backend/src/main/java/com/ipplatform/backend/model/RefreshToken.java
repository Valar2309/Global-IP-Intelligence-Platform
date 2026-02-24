package com.ipplatform.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * DB-backed refresh token.
 * Works for all three principal types: USER, ANALYST, ADMIN.
 * subjectType + subjectId identify which table the token belongs to.
 */
@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 512)
    private String token;

    /** "USER" | "ANALYST" | "ADMIN" */
    @Column(nullable = false)
    private String subjectType;

    /** ID in the corresponding table */
    @Column(nullable = false)
    private Long subjectId;

    /** The username — for quick lookup without joining */
    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private boolean revoked = false;

    @Column(nullable = false)
    private boolean rememberMe = false;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public RefreshToken() {}

    public RefreshToken(String token, String subjectType, Long subjectId,
                        String username, Instant expiresAt, boolean rememberMe) {
        this.token       = token;
        this.subjectType = subjectType;
        this.subjectId   = subjectId;
        this.username    = username;
        this.expiresAt   = expiresAt;
        this.rememberMe  = rememberMe;
    }

    public boolean isValid() {
        return !revoked && Instant.now().isBefore(expiresAt);
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────
    public Long getId() { return id; }
    public String getToken() { return token; }
    public String getSubjectType() { return subjectType; }
    public Long getSubjectId() { return subjectId; }
    public String getUsername() { return username; }
    public Instant getExpiresAt() { return expiresAt; }
    public boolean isRevoked() { return revoked; }
    public void setRevoked(boolean revoked) { this.revoked = revoked; }
    public boolean isRememberMe() { return rememberMe; }
    public Instant getCreatedAt() { return createdAt; }
}