package com.ipplatform.backend.controller;

import com.ipplatform.backend.exception.AuthException;
import com.ipplatform.backend.model.User;
import com.ipplatform.backend.repository.UserRepository;
import com.ipplatform.backend.security.JwtUtil;

import io.jsonwebtoken.JwtException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // ── Login ─────────────────────────────────────────────────────────────────────

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AuthException("Invalid credentials"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new AuthException("Invalid credentials");
        }

        String accessToken  = jwtUtil.generateAccessToken(username, user.getRoles());
        String refreshToken = jwtUtil.generateRefreshToken(username);

        return ResponseEntity.ok(Map.of(
                "accessToken",  accessToken,
                "refreshToken", refreshToken
        ));
    }

    // ── Refresh ───────────────────────────────────────────────────────────────────

    /**
     * Accepts a valid refresh token and issues a new access token.
     * The refresh token itself is NOT rotated here — add rotation when you
     * store refresh tokens in the DB (recommended next step).
     */
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refresh(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");

        try {
            jwtUtil.validateRefreshToken(refreshToken);
        } catch (JwtException e) {
            throw new AuthException("Invalid or expired refresh token");
        }

        String username = jwtUtil.extractUsername(refreshToken);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AuthException("User no longer exists"));

        String newAccessToken = jwtUtil.generateAccessToken(username, user.getRoles());

        return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
    }
}