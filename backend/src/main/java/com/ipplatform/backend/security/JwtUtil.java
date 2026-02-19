package com.ipplatform.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.List;

/**
 * Generates and validates JWTs.
 *
 * Access token  – short-lived (15 min default), carries username + roles.
 * Refresh token – long-lived (7 days default), carries username only.
 *
 * Properties (set in application.yml or .env):
 *   jwt.secret          – HS256 secret (≥256-bit / 32 chars)
 *   jwt.access-expiry   – access token TTL in milliseconds  (default 900_000  = 15 min)
 *   jwt.refresh-expiry  – refresh token TTL in milliseconds (default 604_800_000 = 7 days)
 */
@Component
public class JwtUtil {

    private final Key key;
    private final long accessExpiry;
    private final long refreshExpiry;

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-expiry:900000}") long accessExpiry,
            @Value("${jwt.refresh-expiry:604800000}") long refreshExpiry) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.accessExpiry = accessExpiry;
        this.refreshExpiry = refreshExpiry;
    }

    // ── Generation ────────────────────────────────────────────────────────────

    /**
     * Creates a signed access token that embeds the user's roles.
     * The "roles" claim is a JSON array, e.g. ["ROLE_ADMIN","ROLE_USER"].
     */
    public String generateAccessToken(String username, List<String> roles) {
        return Jwts.builder()
                .setSubject(username)
                .claim("roles", roles)          // <── roles live here
                .claim("type", "access")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessExpiry))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /** Creates a signed refresh token (no roles – roles are re-read from DB on refresh). */
    public String generateRefreshToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .claim("type", "refresh")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshExpiry))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // ── Validation ────────────────────────────────────────────────────────────

    public Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /** Validates the token and asserts it is an access token. */
    public Claims validateAccessToken(String token) {
        Claims claims = parseToken(token);
        if (!"access".equals(claims.get("type"))) {
            throw new JwtException("Not an access token");
        }
        return claims;
    }

    /** Validates the token and asserts it is a refresh token. */
    public Claims validateRefreshToken(String token) {
        Claims claims = parseToken(token);
        if (!"refresh".equals(claims.get("type"))) {
            throw new JwtException("Not a refresh token");
        }
        return claims;
    }

    // ── Extraction helpers ────────────────────────────────────────────────────

    public String extractUsername(String token) {
        return parseToken(token).getSubject();
    }

    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        Object raw = parseToken(token).get("roles");
        return raw instanceof List ? (List<String>) raw : List.of();
    }
}