package com.ipplatform.backend.controller;

import com.ipplatform.backend.exception.AuthException;
import com.ipplatform.backend.model.User;
import com.ipplatform.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

/**
 * User profile update endpoints.
 *
 * PUT  /api/user/profile          → update name and/or email
 * GET  /api/user/profile          → get full profile (same as /me but explicit)
 *
 * All endpoints require a valid ROLE_USER JWT.
 */
@RestController
@RequestMapping("/api/user")
@PreAuthorize("hasRole('USER')")
public class UserProfileController {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileController(UserRepository userRepository,
                                  PasswordEncoder passwordEncoder) {
        this.userRepository  = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ── GET /api/user/profile ─────────────────────────────────────────────────

    /**
     * GET /api/user/profile
     * Returns the current user's full profile.
     *
     * Response 200:
     * {
     *   "id":       1,
     *   "username": "john",
     *   "email":    "john@example.com",
     *   "name":     "John Doe",
     *   "provider": "LOCAL",
     *   "status":   "ACTIVE",
     *   "roles":    ["ROLE_USER"]
     * }
     */
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(Principal principal) {
        User user = getUser(principal.getName());

        Map<String, Object> resp = new HashMap<>();
        resp.put("id",       user.getId());
        resp.put("username", user.getUsername());
        resp.put("email",    user.getEmail()   != null ? user.getEmail()   : "");
        resp.put("name",     user.getName()    != null ? user.getName()    : "");
        resp.put("provider", user.getProvider());
        resp.put("status",   user.getStatus());
        resp.put("roles",    user.getRoles());

        return ResponseEntity.ok(resp);
    }

    // ── PUT /api/user/profile ─────────────────────────────────────────────────

    /**
     * PUT /api/user/profile
     * Updates the current user's name and/or email.
     * All fields are optional — only provided fields are updated.
     *
     * Request:
     * {
     *   "name":  "Johnny Doe",        (optional)
     *   "email": "newemail@test.com"  (optional)
     * }
     *
     * Response 200:
     * {
     *   "message":  "Profile updated successfully.",
     *   "id":       1,
     *   "username": "john",
     *   "name":     "Johnny Doe",
     *   "email":    "newemail@test.com"
     * }
     *
     * Error 400:
     * { "error": "Email already registered" }
     */
    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestBody Map<String, String> req,
            Principal principal) {

        User user = getUser(principal.getName());

        // Update name if provided
        String newName = req.get("name");
        if (newName != null && !newName.isBlank()) {
            user.setName(newName.trim());
        }

        // Update email if provided and different
        String newEmail = req.get("email");
        if (newEmail != null && !newEmail.isBlank()) {
            String trimmed = newEmail.trim().toLowerCase();
            if (!trimmed.equals(user.getEmail())) {
                if (userRepository.existsByEmail(trimmed)) {
                    throw new AuthException("Email already registered");
                }
                user.setEmail(trimmed);
            }
        }

        userRepository.save(user);

        Map<String, Object> resp = new HashMap<>();
        resp.put("message",  "Profile updated successfully.");
        resp.put("id",       user.getId());
        resp.put("username", user.getUsername());
        resp.put("name",     user.getName()  != null ? user.getName()  : "");
        resp.put("email",    user.getEmail() != null ? user.getEmail() : "");

        return ResponseEntity.ok(resp);
    }

    // ── Private helper ────────────────────────────────────────────────────────

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AuthException("User not found"));
    }
}