package com.ipplatform.backend.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

    /**
     * Account lifecycle:
     *
     *  LOCAL USER:
     *   register → ACTIVE → can login immediately
     *
     *  ANALYST:
     *   register → PENDING_DOCUMENT  (must upload identity docs)
     *       ↓ uploads docs + submits
     *   PENDING_REVIEW  (admin reviews documents)
     *       ↓
     *   admin approves → ACTIVE      (can login)
     *   admin rejects  → REJECTED    (blocked)
     *
     *  OAUTH USER:
     *   Google login → ACTIVE immediately
     */
    public enum AccountStatus {
        ACTIVE,
        PENDING_DOCUMENT,
        PENDING_REVIEW,
        REJECTED,
        SUSPENDED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column
    private String password;

    @Column(nullable = false)
    private String provider = "local";

    @Column(name = "provider_id")
    private String providerId;

    @Column
    private String email;

    @Column
    private String name;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    private List<String> roles;

    /**
     * columnDefinition with DEFAULT 'ACTIVE' tells PostgreSQL to use 'ACTIVE'
     * for any existing rows when Hibernate adds this column via ddl-auto=update.
     * Without this, adding NOT NULL to a table with existing rows fails because
     * PostgreSQL sees NULL values before the default is applied.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar(255) default 'ACTIVE'")
    private AccountStatus accountStatus = AccountStatus.ACTIVE;

    // ── Constructors ──────────────────────────────────────────────────────────

    public User() {}

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getProviderId() { return providerId; }
    public void setProviderId(String providerId) { this.providerId = providerId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }

    public AccountStatus getAccountStatus() { return accountStatus; }
    public void setAccountStatus(AccountStatus accountStatus) { this.accountStatus = accountStatus; }

    // ── Helpers ───────────────────────────────────────────────────────────────
    public boolean isActive()          { return accountStatus == AccountStatus.ACTIVE; }
    public boolean isPendingDocument() { return accountStatus == AccountStatus.PENDING_DOCUMENT; }
    public boolean isPendingReview()   { return accountStatus == AccountStatus.PENDING_REVIEW; }
}