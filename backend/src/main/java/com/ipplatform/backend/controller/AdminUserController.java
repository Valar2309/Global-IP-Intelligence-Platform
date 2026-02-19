package com.ipplatform.backend.controller;

import com.ipplatform.backend.model.Role;
import com.ipplatform.backend.model.User;
import com.ipplatform.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Admin-only endpoints for user and role management.
 * All methods are protected by @PreAuthorize("hasRole('ADMIN')").
 * SecurityConfig also blocks /api/admin/** for non-admins as a second layer.
 */
@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserRepository userRepository;

    public AdminUserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ── List all users ───────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listUsers() {
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(u -> Map.<String, Object>of(
                        "id",       u.getId(),
                        "username", u.getUsername(),
                        "email",    u.getEmail(),
                        "roles",    u.getRoles(),
                        "provider", u.getProvider()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(users);
    }

    // ── Assign roles to a user ───────────────────────────────────────────────

    /**
     * Replaces the user's entire role list.
     *
     * PUT /api/admin/users/{id}/roles
     * Body: { "roles": ["ROLE_ANALYST", "ROLE_USER"] }
     *
     * Valid role values: ROLE_ADMIN, ROLE_ANALYST, ROLE_USER
     */
    @PutMapping("/{id}/roles")
    public ResponseEntity<Map<String, Object>> updateRoles(
            @PathVariable Long id,
            @RequestBody Map<String, List<String>> body) {

        @SuppressWarnings("null")
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));

        List<String> newRoles = body.get("roles");
        if (newRoles == null || newRoles.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "roles list must not be empty"));
        }

        // Validate each role value against the enum
        List<String> validRoles;
        try {
            validRoles = newRoles.stream()
                    .map(r -> Role.valueOf(r).value())
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Invalid role. Allowed: ROLE_ADMIN, ROLE_ANALYST, ROLE_USER"
            ));
        }

        user.setRoles(validRoles);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "id",    user.getId(),
                "roles", user.getRoles()
        ));
    }

    // ── Promote shortcut: make a user an Analyst ─────────────────────────────

    @PostMapping("/{id}/promote-analyst")
    public ResponseEntity<Map<String, Object>> promoteToAnalyst(@PathVariable Long id) {
        @SuppressWarnings("null")
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));

        List<String> roles = new java.util.ArrayList<>(user.getRoles() == null
                ? List.of() : user.getRoles());

        if (!roles.contains(Role.ROLE_ANALYST.value())) {
            roles.add(Role.ROLE_ANALYST.value());
        }
        if (!roles.contains(Role.ROLE_USER.value())) {
            roles.add(Role.ROLE_USER.value());
        }

        user.setRoles(roles);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("id", user.getId(), "roles", user.getRoles()));
    }
}