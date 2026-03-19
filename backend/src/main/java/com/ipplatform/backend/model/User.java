package com.ipplatform.backend.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.List;

/**
 * Represents a regular USER account.
 * Completely separate from Analyst — different table, different flow.
 *
 * Table: users
 */
@Entity
@Table(name = "users")
public class User {

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

    @Column(nullable = false)
    private String provider = "LOCAL";

    @Column(name = "provider_id")
    private String providerId;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    private List<String> roles;

    @Column(nullable = false, columnDefinition = "varchar(20) default 'ACTIVE'")
    private String status = "ACTIVE"; // ACTIVE | SUSPENDED

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    // ── Constructors ──────────────────────────────────────────────────────────
    public User() {}

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

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getProviderId() { return providerId; }
    public void setProviderId(String providerId) { this.providerId = providerId; }

    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
}