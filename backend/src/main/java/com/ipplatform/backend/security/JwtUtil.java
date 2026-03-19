package com.ipplatform.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-token-expiry-ms:3600000}")
    private long accessTokenMs;

    private Key key;

    // ✅ Initialize key after values are injected
    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Generate Access Token
     */
    public String generateAccessToken(String username, String role, String subjectType) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .claim("subjectType", subjectType)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Generate Refresh Token
     */
    public String generateRefreshToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .claim("type", "refresh")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 30L * 24 * 60 * 60 * 1000))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Parse Token
     */
    public Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Validate Access Token
     */
    public void validateAccessToken(String token) {
        Claims claims = parseToken(token);
        if ("refresh".equals(claims.get("type"))) {
            throw new JwtException("Refresh token used as access token");
        }
    }

    /**
     * Extract Username
     */
    public String extractUsername(String token) {
        return parseToken(token).getSubject();
    }

    /**
     * Extract Role
     */
    public String extractRole(String token) {
        return (String) parseToken(token).get("role");
    }

    /**
     * Extract Subject Type
     */
    public String extractSubjectType(String token) {
        return (String) parseToken(token).get("subjectType");
    }
}