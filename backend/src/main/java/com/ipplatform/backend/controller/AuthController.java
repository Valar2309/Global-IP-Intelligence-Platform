package com.ipplatform.backend.controller;

import com.ipplatform.backend.service.AuthService;
import com.ipplatform.backend.service.AuthService.TokenPair;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // ── 1. Register ───────────────────────────────────────────────────────────

    /**
     * POST /auth/register
     *
     * Body:
     * {
     *   "username": "john",
     *   "email":    "john@example.com",
     *   "password": "Secret1!",
     *   "name":     "John Doe",
     *   "role":     "USER"     ← or "ANALYST"
     * }
     *
     * USER response (201):
     * { "message": "Account created successfully. Please log in." }
     *
     * ANALYST response (201):
     * {
     *   "message":      "Registration successful. Please upload your identity documents.",
     *   "accessToken":  "eyJ...",
     *   "refreshToken": "eyJ...",
     *   "nextStep":     "/submit-documents"
     * }
     * The analyst JWT allows immediate access to /api/analyst/application/**
     * so the frontend can navigate to the document upload page without re-login.
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> req) {
        String role = req.getOrDefault("role", "USER").trim().toUpperCase();

        if (!role.equals("USER") && !role.equals("ANALYST")) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Invalid role. Must be USER or ANALYST."));
        }

        // register() returns TokenPair for ANALYST, null for USER
        TokenPair tokens = authService.register(
                req.get("username"),
                req.get("email"),
                req.get("password"),
                req.get("name"),
                role
        );

        Map<String, Object> body = new HashMap<>();

        if (role.equals("ANALYST") && tokens != null) {
            body.put("message",      "Registration successful. Please upload your identity documents.");
            body.put("accessToken",  tokens.accessToken());
            body.put("refreshToken", tokens.refreshToken());
            body.put("nextStep",     "/submit-documents");
        } else {
            body.put("message", "Account created successfully. Please log in.");
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    // ── 2. Login ──────────────────────────────────────────────────────────────

    /**
     * POST /auth/login
     * Body: { "username": "john", "password": "Secret1!", "rememberMe": false }
     *
     * Returns 401 with specific message for PENDING_DOCUMENT / PENDING_REVIEW /
     * REJECTED / SUSPENDED accounts.
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, Object> req) {
        String  username   = (String) req.get("username");
        String  password   = (String) req.get("password");
        boolean rememberMe = Boolean.TRUE.equals(req.get("rememberMe"));

        TokenPair tokens = authService.login(username, password, rememberMe);

        return ResponseEntity.ok(Map.of(
                "accessToken",  tokens.accessToken(),
                "refreshToken", tokens.refreshToken(),
                "username",     tokens.user().getUsername(),
                "email",        tokens.user().getEmail()  != null ? tokens.user().getEmail()  : "",
                "name",         tokens.user().getName()   != null ? tokens.user().getName()   : "",
                "roles",        tokens.user().getRoles(),
                "accountStatus", tokens.user().getAccountStatus().name()
        ));
    }

    // ── 3. Refresh ────────────────────────────────────────────────────────────

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refresh(@RequestBody Map<String, String> req) {
        TokenPair tokens = authService.refresh(req.get("refreshToken"));
        return ResponseEntity.ok(Map.of(
                "accessToken",  tokens.accessToken(),
                "refreshToken", tokens.refreshToken()
        ));
    }

    // ── 4. Logout ─────────────────────────────────────────────────────────────

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestBody Map<String, String> req) {
        authService.logout(req.get("refreshToken"));
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @PostMapping("/logout-all")
    public ResponseEntity<Map<String, String>> logoutAll(Principal principal) {
        authService.logoutAll(principal.getName());
        return ResponseEntity.ok(Map.of("message", "Logged out from all devices"));
    }

    // ── 5. Forgot Password ────────────────────────────────────────────────────

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> req) {
        authService.forgotPassword(req.get("email"));
        return ResponseEntity.ok(Map.of(
                "message", "If that email is registered, you will receive a reset link shortly."
        ));
    }

    // ── 6. Reset Password ─────────────────────────────────────────────────────

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> req) {
        authService.resetPassword(req.get("token"), req.get("newPassword"));
        return ResponseEntity.ok(Map.of(
                "message", "Password reset successfully. Please log in with your new password."
        ));
    }

    // ── 7. Change Password ────────────────────────────────────────────────────

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @RequestBody Map<String, String> req,
            Principal principal) {
        authService.changePassword(
                principal.getName(),
                req.get("currentPassword"),
                req.get("newPassword")
        );
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    // ── 8. Current User ───────────────────────────────────────────────────────

    /**
     * GET /auth/me
     * Returns current user info including accountStatus.
     * Frontend uses accountStatus to decide which page to show
     * (e.g. PENDING_DOCUMENT → redirect to /submit-documents).
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(Principal principal) {
        var user = authService.getUserByUsername(principal.getName());
        return ResponseEntity.ok(Map.of(
                "username",      user.getUsername(),
                "email",         user.getEmail()  != null ? user.getEmail()  : "",
                "name",          user.getName()   != null ? user.getName()   : "",
                "roles",         user.getRoles(),
                "provider",      user.getProvider(),
                "accountStatus", user.getAccountStatus().name()
                // Note: removed user.isApproved() — use accountStatus instead
        ));
    }
}