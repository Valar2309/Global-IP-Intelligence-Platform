package com.ipplatform.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Represents an ADMIN account — separate table, seeded via DataInitializer.
 *
 * Admin does NOT register — default credentials are set in application.properties
 * and seeded on first startup.
 *
 * Table: admins
 */
@Entity
@Table(name = "admins")
public class Admin {

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

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean active = true;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    // ── Constructors ──────────────────────────────────────────────────────────
    public Admin() {}

    public Admin(String username, String password, String email, String name) {
        this.username = username;
        this.password = password;
        this.email    = email;
        this.name     = name;
    }

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

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public Instant getCreatedAt() { return createdAt; }
}