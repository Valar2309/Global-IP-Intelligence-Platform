package com.ipplatform.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.List;

@Component
public class JwtUtil {

    private final Key key;
    private final long accessTokenMs;

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-token-expiry-ms:3600000}") long accessTokenMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenMs = accessTokenMs;
    }

    /**
     * Generates a signed access token.
     *
     * @param username     the subject's username
     * @param role         single role string e.g. "ROLE_USER", "ROLE_ANALYST", "ROLE_ADMIN"
     * @param subjectType  "USER" | "ANALYST" | "ADMIN" — stored as claim for filter to use
     */
    public String generateAccessToken(String username, String role, String subjectType) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role",        role)
                .claim("subjectType", subjectType)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .claim("type", "refresh")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 30L * 24 * 60 * 60 * 1000))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public void validateAccessToken(String token) {
        Claims claims = parseToken(token);
        if ("refresh".equals(claims.get("type"))) {
            throw new JwtException("Refresh token used as access token");
        }
    }

    public String extractUsername(String token) {
        return parseToken(token).getSubject();
    }

    public String extractRole(String token) {
        return (String) parseToken(token).get("role");
    }

    public String extractSubjectType(String token) {
        return (String) parseToken(token).get("subjectType");
    }
}