package com.ipplatform.backend.controller;

import com.ipplatform.backend.model.Analyst;
import com.ipplatform.backend.repository.AnalystRepository;
import com.ipplatform.backend.service.AnalystService;
import com.ipplatform.backend.service.AnalystService.TokenPair;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.Map;

/**
 * ANALYST endpoints — separate from User and Admin.
 *
 * POST /api/analyst/register   → register with document (multipart, one request)
 * POST /api/analyst/login      → login (only if APPROVED)
 * POST /api/analyst/refresh    → refresh token
 * POST /api/analyst/logout     → logout
 */
@RestController
@RequestMapping("/api/analyst")
public class AnalystController {

    private final AnalystService analystService;
    private final AnalystRepository analystRepository;

    public AnalystController(AnalystService analystService,
                             AnalystRepository analystRepository) {
        this.analystService = analystService;
        this.analystRepository = analystRepository;
    }

    /**
     * POST /api/analyst/register
     * Content-Type: multipart/form-data
     *
     * ALL fields in ONE request — no separate upload step.
     *
     * Form fields:
     * ┌──────────────┬──────────────────────────────────────────────────────────┐
     * │ Field        │ Description                                              │
     * ├──────────────┼──────────────────────────────────────────────────────────┤
     * │ username     │ Unique username                                          │
     * │ email        │ Email address                                            │
     * │ password     │ Min 8 chars, 1 uppercase, 1 number                      │
     * │ name         │ Full name                                                │
     * │ documentType │ AADHAAR_CARD | PAN_CARD | PASSPORT | VOTER_ID |         │
     * │              │ BIRTH_CERTIFICATE | DRIVING_LICENSE | OTHER              │
     * │ purpose      │ (optional) Why do you need analyst access?               │
     * │ organization │ (optional) Company or institution                        │
     * │ document     │ File — JPEG / PNG / PDF, max 5MB                        │
     * └──────────────┴──────────────────────────────────────────────────────────┘
     *
     * Response 201:
     * {
     *   "message": "Application submitted successfully. You will be notified once approved.",
     *   "status":  "PENDING"
     * }
     *
     * NOTE: NO token returned. Analyst CANNOT login until Admin approves.
     */
    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> register(
            @RequestParam("username")                          String username,
            @RequestParam("email")                             String email,
            @RequestParam("password")                          String password,
            @RequestParam("name")                              String name,
            @RequestParam("documentType")                      String documentType,
            @RequestParam(value = "purpose",      required = false) String purpose,
            @RequestParam(value = "organization", required = false) String organization,
            @RequestParam("document")                          MultipartFile document
    ) throws IOException {

        analystService.register(
                username, email, password, name,
                documentType, purpose, organization,
                document
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Application submitted successfully. " +
                           "You will be notified by email once your documents are reviewed and approved.",
                "status",  "PENDING"
        ));
    }

    /**
     * POST /api/analyst/login
     * Content-Type: application/json
     *
     * Request:
     * {
     *   "username":   "analyst1",
     *   "password":   "Secret@1",
     *   "rememberMe": false
     * }
     *
     * Response 200 (only if status = APPROVED):
     * {
     *   "accessToken":  "eyJ...",
     *   "refreshToken": "eyJ...",
     *   "username":     "analyst1",
     *   "role":         "ROLE_ANALYST",
     *   "userType":     "ANALYST"
     * }
     *
     * Response 401 if PENDING:
     * { "error": "Your application is pending admin approval..." }
     *
     * Response 401 if REJECTED:
     * { "error": "Your analyst application was rejected. Reason: ..." }
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, Object> req) {
        String  username   = (String) req.get("username");
        String  password   = (String) req.get("password");
        boolean rememberMe = Boolean.TRUE.equals(req.get("rememberMe"));

        TokenPair tokens = analystService.login(username, password, rememberMe);
        return ResponseEntity.ok(Map.of(
                "accessToken",  tokens.accessToken(),
                "refreshToken", tokens.refreshToken(),
                "username",     tokens.username(),
                "role",         tokens.role(),
                "userType",     tokens.userType()
        ));
    }

    /**
     * POST /api/analyst/refresh
     * { "refreshToken": "eyJ..." }
     */
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refresh(@RequestBody Map<String, String> req) {
        TokenPair tokens = analystService.refresh(req.get("refreshToken"));
        return ResponseEntity.ok(Map.of(
                "accessToken",  tokens.accessToken(),
                "refreshToken", tokens.refreshToken()
        ));
    }

    /**
     * POST /api/analyst/logout
     * { "refreshToken": "eyJ..." }
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestBody Map<String, String> req) {
        analystService.logout(req.get("refreshToken"));
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    /**
     * GET /api/analyst/me
     * Returns current analyst info. Requires a valid ANALYST JWT.
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(Principal principal) {
        Analyst analyst = analystRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("Analyst not found"));
        return ResponseEntity.ok(Map.of(
                "id",           analyst.getId(),
                "username",     analyst.getUsername(),
                "email",        analyst.getEmail()        != null ? analyst.getEmail()        : "",
                "name",         analyst.getName()         != null ? analyst.getName()         : "",
                "organization", analyst.getOrganization() != null ? analyst.getOrganization() : "",
                "status",       analyst.getStatus().name(),
                "createdAt",    analyst.getCreatedAt().toString()
        ));
    }
}
