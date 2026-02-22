package com.ipplatform.backend.controller;

import com.ipplatform.backend.model.Role;
import com.ipplatform.backend.model.User;
import com.ipplatform.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
//@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserRepository userRepository;

    public AdminUserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ── List all users (NOW includes approval status) ─────────────────────────

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listUsers() {
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(u -> Map.<String, Object>of(
                        "id",       u.getId(),
                        "username", u.getUsername(),
                        "email",    u.getEmail(),
                        "roles",    u.getRoles(),
                        "provider", u.getProvider(),
                        "approved", u.isApproved()   // ✅ added
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(users);
    }

    // ── Update roles ─────────────────────────────────────────────────────────

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

    // ── APPROVE ANALYST ACCOUNT ─────────────────────────────────────────────

    @PutMapping("/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveAnalyst(@PathVariable Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));

        if (!user.getRoles().contains(Role.ROLE_ANALYST.value())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "User is not an analyst"));
        }

        user.setApproved(true);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Analyst approved successfully",
                "id", user.getId(),
                "approved", user.isApproved()
        ));
    }

    // ── Promote shortcut (also auto-approve) ─────────────────────────────────

    @PostMapping("/{id}/promote-analyst")
    public ResponseEntity<Map<String, Object>> promoteToAnalyst(@PathVariable Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));

        List<String> roles = new java.util.ArrayList<>(
                user.getRoles() == null ? List.of() : user.getRoles()
        );

        if (!roles.contains(Role.ROLE_ANALYST.value())) {
            roles.add(Role.ROLE_ANALYST.value());
        }
        if (!roles.contains(Role.ROLE_USER.value())) {
            roles.add(Role.ROLE_USER.value());
        }

        user.setRoles(roles);
        user.setApproved(true);   // ✅ important
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "roles", user.getRoles(),
                "approved", user.isApproved()
        ));
    }
}