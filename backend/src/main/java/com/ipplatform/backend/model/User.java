package com.ipplatform.backend.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    // Nullable — OAuth users have no password
    @Column
    private String password;

    // "local" for username/password users, "google" for OAuth users
    @Column(nullable = false)
    private String provider = "local";

    // Google's unique user ID — null for local users
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

    // ── Constructors ─────────────────────────────────────────────────────────────

    public User() {}

    // For local (username/password) users
    public User(String username, String password, List<String> roles) {
        this.username = username;
        this.password = password;
        this.roles = roles;
        this.provider = "local";
    }

    // For OAuth (Google) users
    public User(String username, String email, String name,
                String provider, String providerId, List<String> roles) {
        this.username = username;
        this.email = email;
        this.name = name;
        this.provider = provider;
        this.providerId = providerId;
        this.roles = roles;
    }

    // ── Getters & Setters ────────────────────────────────────────────────────────

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
}