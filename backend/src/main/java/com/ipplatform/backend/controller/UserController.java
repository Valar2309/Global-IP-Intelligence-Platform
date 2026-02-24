package com.ipplatform.backend.controller;

import com.ipplatform.backend.model.User;
import com.ipplatform.backend.service.UserService;
import com.ipplatform.backend.service.UserService.TokenPair;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

/**
 * USER endpoints — completely separate from Analyst and Admin.
 *
 * POST /api/user/register         → create user account (active immediately)
 * POST /api/user/login            → login
 * POST /api/user/refresh          → refresh access token
 * POST /api/user/logout           → logout
 * GET  /api/user/me               → current user info
 * POST /api/user/forgot-password  → send reset email
 * POST /api/user/reset-password   → consume reset token
 * POST /api/user/change-password  → change password (authenticated)
 */
@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ── Register ───────────────────────────────────────────────────────────────

    /**
     * POST /api/user/register
     * Content-Type: application/json
     *
     * Request:
     * {
     *   "username": "john",
     *   "email":    "john@example.com",
     *   "password": "Secret@1",
     *   "name":     "John Doe"
     * }
     *
     * Response 201:
     * { "message": "Account created successfully. Please log in." }
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> req) {
        userService.register(
                req.get("username"),
                req.get("email"),
                req.get("password"),
                req.get("name")
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Account created successfully. Please log in."
        ));
    }

    // ── Login ──────────────────────────────────────────────────────────────────

    /**
     * POST /api/user/login
     * Content-Type: application/json
     *
     * Request:
     * { "username": "john", "password": "Secret@1", "rememberMe": false }
     *
     * Response 200:
     * {
     *   "accessToken":  "eyJ...",
     *   "refreshToken": "eyJ...",
     *   "username":     "john",
     *   "role":         "ROLE_USER",
     *   "userType":     "USER"
     * }
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, Object> req) {
        String  username   = (String) req.get("username");
        String  password   = (String) req.get("password");
        boolean rememberMe = Boolean.TRUE.equals(req.get("rememberMe"));

        TokenPair tokens = userService.login(username, password, rememberMe);
        return ResponseEntity.ok(Map.of(
                "accessToken",  tokens.accessToken(),
                "refreshToken", tokens.refreshToken(),
                "username",     tokens.username(),
                "role",         tokens.role(),
                "userType",     tokens.userType()
        ));
    }

    // ── Refresh ────────────────────────────────────────────────────────────────

    /** POST /api/user/refresh — { "refreshToken": "eyJ..." } */
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refresh(@RequestBody Map<String, String> req) {
        TokenPair tokens = userService.refresh(req.get("refreshToken"));
        return ResponseEntity.ok(Map.of(
                "accessToken",  tokens.accessToken(),
                "refreshToken", tokens.refreshToken()
        ));
    }

    // ── Logout ─────────────────────────────────────────────────────────────────

    /** POST /api/user/logout — { "refreshToken": "eyJ..." } */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestBody Map<String, String> req) {
        userService.logout(req.get("refreshToken"));
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    // ── Me (current user info) ─────────────────────────────────────────────────

    /**
     * GET /api/user/me
     * Returns current user info. Requires a valid USER JWT.
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(Principal principal) {
        User user = userService.getUserByUsername(principal.getName());
        return ResponseEntity.ok(Map.of(
                "username", user.getUsername(),
                "email",    user.getEmail()  != null ? user.getEmail()  : "",
                "name",     user.getName()   != null ? user.getName()   : "",
                "roles",    user.getRoles(),
                "provider", user.getProvider(),
                "status",   user.getStatus()
        ));
    }

    // ── Forgot Password ────────────────────────────────────────────────────────

    /**
     * POST /api/user/forgot-password
     * { "email": "john@example.com" }
     * Always returns 200 — does not reveal whether the email exists.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> req) {
        userService.forgotPassword(req.get("email"));
        return ResponseEntity.ok(Map.of(
                "message", "If that email is registered, you will receive a reset link shortly."
        ));
    }

    // ── Reset Password ─────────────────────────────────────────────────────────

    /**
     * POST /api/user/reset-password
     * { "token": "uuid", "newPassword": "NewSecret@1" }
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> req) {
        userService.resetPassword(req.get("token"), req.get("newPassword"));
        return ResponseEntity.ok(Map.of(
                "message", "Password reset successfully. Please log in with your new password."
        ));
    }

    // ── Change Password ────────────────────────────────────────────────────────

    /**
     * POST /api/user/change-password
     * { "currentPassword": "Old@123", "newPassword": "New@123" }
     * Requires a valid USER JWT.
     */
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @RequestBody Map<String, String> req,
            Principal principal) {
        userService.changePassword(
                principal.getName(),
                req.get("currentPassword"),
                req.get("newPassword")
        );
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
}
