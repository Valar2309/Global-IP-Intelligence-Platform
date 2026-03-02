package com.ipplatform.backend.controller;

import com.ipplatform.backend.exception.AuthException;
import com.ipplatform.backend.model.Admin;
import com.ipplatform.backend.repository.AdminRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

/**
 * Admin self-profile endpoints.
 *
 * GET  /api/admin/profile            → get own profile
 * PUT  /api/admin/profile            → update own name and/or email
 * POST /api/admin/change-password    → change own password
 *
 * All endpoints require ROLE_ADMIN JWT.
 * These are "self-service" endpoints — for admin-to-admin user management
 * use AdminUserController instead.
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProfileController {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminProfileController(AdminRepository adminRepository,
                                   PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ── GET /api/admin/profile ────────────────────────────────────────────────

    /**
     * GET /api/admin/profile
     * Returns the logged-in admin's own profile.
     *
     * Response 200:
     * {
     *   "id":        1,
     *   "username":  "admin",
     *   "email":     "admin@ipplatform.com",
     *   "name":      "Platform Admin",
     *   "active":    true,
     *   "createdAt": "2024-01-01T00:00:00Z"
     * }
     */
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(Principal principal) {
        Admin admin = getAdmin(principal.getName());

        Map<String, Object> resp = new HashMap<>();
        resp.put("id",        admin.getId());
        resp.put("username",  admin.getUsername());
        resp.put("email",     admin.getEmail() != null ? admin.getEmail() : "");
        resp.put("name",      admin.getName()  != null ? admin.getName()  : "");
        resp.put("active",    admin.isActive());
        resp.put("createdAt", admin.getCreatedAt().toString());

        return ResponseEntity.ok(resp);
    }

    // ── PUT /api/admin/profile ────────────────────────────────────────────────

    /**
     * PUT /api/admin/profile
     * Updates the logged-in admin's own name and/or email.
     * All fields are optional — only provided (non-blank) fields are updated.
     *
     * Request:
     * {
     *   "name":  "Super Admin",             (optional)
     *   "email": "superadmin@platform.com"  (optional)
     * }
     *
     * Response 200:
     * {
     *   "message":  "Profile updated successfully.",
     *   "id":       1,
     *   "username": "admin",
     *   "name":     "Super Admin",
     *   "email":    "superadmin@platform.com"
     * }
     *
     * Error 400:
     * { "error": "Email already registered" }
     */
    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestBody Map<String, String> req,
            Principal principal) {

        Admin admin = getAdmin(principal.getName());

        // Update name if provided
        String newName = req.get("name");
        if (newName != null && !newName.isBlank()) {
            admin.setName(newName.trim());
        }

        // Update email if provided and different
        String newEmail = req.get("email");
        if (newEmail != null && !newEmail.isBlank()) {
            String trimmed = newEmail.trim().toLowerCase();
            if (!trimmed.equals(admin.getEmail())) {
                // Check uniqueness across admins table
                if (adminRepository.findAll().stream()
                        .anyMatch(a -> trimmed.equals(a.getEmail())
                                    && !a.getId().equals(admin.getId()))) {
                    throw new AuthException("Email already in use by another admin");
                }
                admin.setEmail(trimmed);
            }
        }

        adminRepository.save(admin);

        Map<String, Object> resp = new HashMap<>();
        resp.put("message",  "Profile updated successfully.");
        resp.put("id",       admin.getId());
        resp.put("username", admin.getUsername());
        resp.put("name",     admin.getName()  != null ? admin.getName()  : "");
        resp.put("email",    admin.getEmail() != null ? admin.getEmail() : "");

        return ResponseEntity.ok(resp);
    }

    // ── POST /api/admin/change-password ──────────────────────────────────────

    /**
     * POST /api/admin/change-password
     * Allows the logged-in admin to change their own password.
     *
     * Request:
     * {
     *   "currentPassword": "Admin@123",
     *   "newPassword":     "NewAdmin@456"
     * }
     *
     * Password rules: min 8 chars, 1 uppercase, 1 number.
     *
     * Response 200:
     * { "message": "Password changed successfully." }
     *
     * Error 400:
     * { "error": "Current password is incorrect" }
     */
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @RequestBody Map<String, String> req,
            Principal principal) {

        Admin admin = getAdmin(principal.getName());

        String currentPassword = req.get("currentPassword");
        String newPassword     = req.get("newPassword");

        if (currentPassword == null || currentPassword.isBlank())
            throw new AuthException("currentPassword is required");

        if (!passwordEncoder.matches(currentPassword, admin.getPassword()))
            throw new AuthException("Current password is incorrect");

        validatePassword(newPassword);

        admin.setPassword(passwordEncoder.encode(newPassword));
        adminRepository.save(admin);

        return ResponseEntity.ok(Map.of("message", "Password changed successfully."));
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private Admin getAdmin(String username) {
        return adminRepository.findByUsername(username)
                .orElseThrow(() -> new AuthException("Admin not found"));
    }

    private void validatePassword(String p) {
        if (p == null || p.length() < 8)
            throw new AuthException("Password must be at least 8 characters");
        if (!p.matches(".*[A-Z].*"))
            throw new AuthException("Password must contain at least one uppercase letter");
        if (!p.matches(".*[0-9].*"))
            throw new AuthException("Password must contain at least one number");
    }
}