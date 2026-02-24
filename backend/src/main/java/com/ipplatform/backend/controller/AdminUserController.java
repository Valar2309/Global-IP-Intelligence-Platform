package com.ipplatform.backend.controller;

import com.ipplatform.backend.model.Role;
import com.ipplatform.backend.model.User;
import com.ipplatform.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Admin endpoints for user management.
 *
 * NOTE: Analyst approval/rejection is handled by AdminController.
 * This controller handles user listing, role assignment, and suspension.
 */
@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserRepository userRepository;

    public AdminUserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ── List all users ────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listUsers() {
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(u -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id",       u.getId());
                    m.put("username", u.getUsername());
                    m.put("email",    u.getEmail()  != null ? u.getEmail()  : "");
                    m.put("name",     u.getName()   != null ? u.getName()   : "");
                    m.put("roles",    u.getRoles());
                    m.put("provider", u.getProvider());
                    m.put("status",   u.getStatus());
                    return m;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(users);
    }

    // ── Update roles ──────────────────────────────────────────────────────────

    /**
     * PUT /api/admin/users/{id}/roles
     * Body: { "roles": ["ROLE_ANALYST", "ROLE_USER"] }
     */
    @PutMapping("/{id}/roles")
    public ResponseEntity<Map<String, Object>> updateRoles(
            @PathVariable Long id,
            @RequestBody Map<String, List<String>> body) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));

        List<String> newRoles = body.get("roles");
        if (newRoles == null || newRoles.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "roles list must not be empty"));
        }

        List<String> validRoles;
        try {
            validRoles = newRoles.stream()
                    .map(r -> Role.valueOf(r).value())
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Invalid role. Allowed: ROLE_ADMIN, ROLE_ANALYST, ROLE_USER"));
        }

        user.setRoles(validRoles);
        userRepository.save(user);

        Map<String, Object> resp = new HashMap<>();
        resp.put("id",    user.getId());
        resp.put("roles", user.getRoles());
        return ResponseEntity.ok(resp);
    }

    // ── Suspend / unsuspend ───────────────────────────────────────────────────

    /**
     * POST /api/admin/users/{id}/suspend
     * Blocks the user from logging in without deleting the account.
     */
    @PostMapping("/{id}/suspend")
    public ResponseEntity<Map<String, Object>> suspendUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));

        user.setStatus("SUSPENDED");
        userRepository.save(user);

        Map<String, Object> resp = new HashMap<>();
        resp.put("message", "User suspended");
        resp.put("id",      user.getId());
        resp.put("status",  user.getStatus());
        return ResponseEntity.ok(resp);
    }

    /**
     * POST /api/admin/users/{id}/unsuspend
     * Restores a suspended user to ACTIVE.
     */
    @PostMapping("/{id}/unsuspend")
    public ResponseEntity<Map<String, Object>> unsuspendUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));

        if (!"SUSPENDED".equals(user.getStatus())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "User is not suspended"));
        }

        user.setStatus("ACTIVE");
        userRepository.save(user);

        Map<String, Object> resp = new HashMap<>();
        resp.put("message", "User unsuspended");
        resp.put("id",      user.getId());
        resp.put("status",  user.getStatus());
        return ResponseEntity.ok(resp);
    }
}
