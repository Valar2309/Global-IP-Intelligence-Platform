package com.ipplatform.backend.controller;

import com.ipplatform.backend.service.AuthService;
import com.ipplatform.backend.service.AuthService.TokenPair;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

/**
 * All authentication endpoints.
 *
 * ┌─────────────────────────────────┬────────────┬─────────────────────────────────────────┐
 * │ Endpoint                        │ Auth       │ Purpose                                 │
 * ├─────────────────────────────────┼────────────┼─────────────────────────────────────────┤
 * │ POST /auth/register             │ Public     │ Create new local account                │
 * │ POST /auth/login                │ Public     │ Login with username+password             │
 * │ POST /auth/refresh              │ Public     │ Rotate refresh token → new access token  │
 * │ POST /auth/logout               │ Public     │ Revoke current refresh token            │
 * │ POST /auth/logout-all           │ JWT needed │ Revoke all sessions (all devices)       │
 * │ POST /auth/forgot-password      │ Public     │ Send reset email                        │
 * │ POST /auth/reset-password       │ Public     │ Set new password using reset token      │
 * │ POST /auth/change-password      │ JWT needed │ Change password (logged-in user)        │
 * │ GET  /auth/me                   │ JWT needed │ Get current user's profile + roles      │
 * └─────────────────────────────────┴────────────┴─────────────────────────────────────────┘
 *
 * OAuth2 endpoints (handled by Spring Security automatically):
 *   GET /oauth2/authorization/google  → redirect to Google
 *   GET /oauth2/callback/google       → Google calls this after auth (handled by Spring)
 */
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
     * Body: { "username": "john", "email": "john@example.com",
     *         "password": "Secret1!", "name": "John Doe" }
     *
     * Password rules: min 8 chars, 1 uppercase, 1 number.
     * New accounts always get ROLE_USER.
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody Map<String, String> req) {
        authService.register(
                req.get("username"),
                req.get("email"),
                req.get("password"),
                req.get("name")
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Account created successfully. Please log in."));
    }

    // ── 2. Login ──────────────────────────────────────────────────────────────

    /**
     * POST /auth/login
     * Body: { "username": "john", "password": "Secret1!", "rememberMe": true }
     *
     * rememberMe: false → 7-day refresh token
     * rememberMe: true  → 30-day refresh token
     *
     * Response includes: accessToken, refreshToken, username, email, roles
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, Object> req) {
        String username   = (String) req.get("username");
        String password   = (String) req.get("password");
        boolean rememberMe = Boolean.TRUE.equals(req.get("rememberMe"));

        TokenPair tokens = authService.login(username, password, rememberMe);

        return ResponseEntity.ok(Map.of(
                "accessToken",  tokens.accessToken(),
                "refreshToken", tokens.refreshToken(),
                "username",     tokens.user().getUsername(),
                "email",        tokens.user().getEmail() != null ? tokens.user().getEmail() : "",
                "roles",        tokens.user().getRoles()
        ));
    }

    // ── 3. Refresh Token ──────────────────────────────────────────────────────

    /**
     * POST /auth/refresh
     * Body: { "refreshToken": "..." }
     *
     * Returns a NEW access token + NEW refresh token (rotation).
     * The old refresh token is immediately invalidated.
     */
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refresh(@RequestBody Map<String, String> req) {
        TokenPair tokens = authService.refresh(req.get("refreshToken"));

        return ResponseEntity.ok(Map.of(
                "accessToken",  tokens.accessToken(),
                "refreshToken", tokens.refreshToken()
        ));
    }

    // ── 4. Logout ─────────────────────────────────────────────────────────────

    /**
     * POST /auth/logout
     * Body: { "refreshToken": "..." }
     *
     * Revokes this refresh token. The access token expires on its own.
     * No Authorization header needed — clients call this even if the access token expired.
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestBody Map<String, String> req) {
        authService.logout(req.get("refreshToken"));
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    /**
     * POST /auth/logout-all
     * Requires: Authorization: Bearer <accessToken>
     *
     * Revokes ALL refresh tokens for the current user (logs out all devices).
     */
    @PostMapping("/logout-all")
    public ResponseEntity<Map<String, String>> logoutAll(Principal principal) {
        authService.logoutAll(principal.getName());
        return ResponseEntity.ok(Map.of("message", "Logged out from all devices"));
    }

    // ── 5. Forgot Password ────────────────────────────────────────────────────

    /**
     * POST /auth/forgot-password
     * Body: { "email": "john@example.com" }
     *
     * Always returns 200 OK even if the email doesn't exist
     * (prevents user enumeration attacks).
     * Sends a reset link to the email if it belongs to a local account.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> req) {
        authService.forgotPassword(req.get("email"));
        return ResponseEntity.ok(Map.of(
                "message", "If that email is registered, you will receive a reset link shortly."
        ));
    }

    // ── 6. Reset Password ─────────────────────────────────────────────────────

    /**
     * POST /auth/reset-password
     * Body: { "token": "<token from email link>", "newPassword": "NewSecret1!" }
     *
     * Token is valid for 60 minutes (configurable).
     * After reset, all sessions are revoked — user must log in again.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> req) {
        authService.resetPassword(req.get("token"), req.get("newPassword"));
        return ResponseEntity.ok(Map.of(
                "message", "Password reset successfully. Please log in with your new password."
        ));
    }

    // ── 7. Change Password ────────────────────────────────────────────────────

    /**
     * POST /auth/change-password
     * Requires: Authorization: Bearer <accessToken>
     * Body: { "currentPassword": "OldSecret1!", "newPassword": "NewSecret2!" }
     *
     * For logged-in users who know their current password.
     */
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

    // ── 8. Get Current User ───────────────────────────────────────────────────

    /**
     * GET /auth/me
     * Requires: Authorization: Bearer <accessToken>
     *
     * Returns the current user's profile and roles.
     * Useful for the frontend to populate the profile page on load.
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(Principal principal) {
        var user = authService.getUserByUsername(principal.getName());
        return ResponseEntity.ok(Map.of(
                "username", user.getUsername(),
                "email",    user.getEmail() != null ? user.getEmail() : "",
                "name",     user.getName() != null ? user.getName() : "",
                "roles",    user.getRoles(),
                "provider", user.getProvider()
        ));
    }
}