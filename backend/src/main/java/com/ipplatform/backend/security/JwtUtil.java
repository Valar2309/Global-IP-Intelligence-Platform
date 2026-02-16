package com.ipplatform.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.List;

@Component
public class JwtUtil {

    private final Key secretKey;
    private final long accessTokenExpiry;
    private final long refreshTokenExpiry;

    // Values injected from application.properties
    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-token-expiry-ms:3600000}") long accessTokenExpiry,
            @Value("${jwt.refresh-token-expiry-ms:604800000}") long refreshTokenExpiry) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes());
        this.accessTokenExpiry = accessTokenExpiry;
        this.refreshTokenExpiry = refreshTokenExpiry;
    }

    // ── Access Token ────────────────────────────────────────────────────────────

    public String generateAccessToken(String username, List<String> roles) {
        return Jwts.builder()
                .setSubject(username)
                .claim("roles", roles)
                .claim("type", "access")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenExpiry))
                .signWith(secretKey)
                .compact();
    }

    // ── Refresh Token ────────────────────────────────────────────────────────────

    public String generateRefreshToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .claim("type", "refresh")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpiry))
                .signWith(secretKey)
                .compact();
    }

    // ── Extraction ───────────────────────────────────────────────────────────────

    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        Object roles = getClaims(token).get("roles");
        return roles instanceof List ? (List<String>) roles : List.of();
    }

    public boolean isAccessToken(String token) {
        return "access".equals(getClaims(token).get("type"));
    }

    public boolean isRefreshToken(String token) {
        return "refresh".equals(getClaims(token).get("type"));
    }

    // ── Validation ───────────────────────────────────────────────────────────────

    /**
     * Returns true only for valid, non-expired access tokens.
     * Throws typed exceptions so callers can respond with specific HTTP status codes.
     */
    public boolean validateAccessToken(String token) {
        Claims claims = getClaims(token); // throws on invalid/expired
        if (!"access".equals(claims.get("type"))) {
            throw new JwtException("Token is not an access token");
        }
        return true;
    }

    public boolean validateRefreshToken(String token) {
        Claims claims = getClaims(token);
        if (!"refresh".equals(claims.get("type"))) {
            throw new JwtException("Token is not a refresh token");
        }
        return true;
    }

    // ── Internal ─────────────────────────────────────────────────────────────────

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}