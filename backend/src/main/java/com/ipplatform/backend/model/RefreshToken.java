package com.ipplatform.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Stores refresh tokens in the database.
 *
 * Why store in DB?
 *  - Logout: delete the token → it can never be used again
 *  - Remember Me: long-lived tokens persist across server restarts
 *  - Token rotation: each /auth/refresh issues a new token and invalidates the old one
 *  - Security: if a token is stolen and used, the legitimate user's next use detects reuse
 */
@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 512)
    private String token;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Instant expiresAt;

    /** True for remember-me tokens (30 days), false for normal session (7 days). */
    @Column(nullable = false)
    private boolean rememberMe = false;

    /** Set to true when the token is used — next use with this token = reuse attack. */
    @Column(nullable = false)
    private boolean revoked = false;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public RefreshToken() {}

    public RefreshToken(String token, User user, Instant expiresAt, boolean rememberMe) {
        this.token = token;
        this.user = user;
        this.expiresAt = expiresAt;
        this.rememberMe = rememberMe;
    }

    public boolean isExpired() { return Instant.now().isAfter(expiresAt); }
    public boolean isValid()   { return !revoked && !isExpired(); }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }
    public String getToken() { return token; }
    public User getUser() { return user; }
    public Instant getExpiresAt() { return expiresAt; }
    public boolean isRememberMe() { return rememberMe; }
    public boolean isRevoked() { return revoked; }
    public void setRevoked(boolean revoked) { this.revoked = revoked; }
    public Instant getCreatedAt() { return createdAt; }
}