package com.ipplatform.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Stores one-time password reset tokens.
 * Created on "Forgot Password" → emailed to user → consumed on "Reset Password".
 * Deleted after use or expiry.
 */
@Entity
@Table(name = "password_reset_tokens")
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The secure random token sent in the reset email link. */
    @Column(nullable = false, unique = true)
    private String token;

    /** Which user this token belongs to. */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Token expires 1 hour after creation. */
    @Column(nullable = false)
    private Instant expiresAt;

    /** Marks the token as used so it can't be replayed. */
    @Column(nullable = false)
    private boolean used = false;

    public PasswordResetToken() {}

    public PasswordResetToken(String token, User user, Instant expiresAt) {
        this.token = token;
        this.user = user;
        this.expiresAt = expiresAt;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    public boolean isValid() {
        return !used && !isExpired();
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }
    public String getToken() { return token; }
    public User getUser() { return user; }
    public Instant getExpiresAt() { return expiresAt; }
    public boolean isUsed() { return used; }
    public void setUsed(boolean used) { this.used = used; }
}