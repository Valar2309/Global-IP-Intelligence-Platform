package com.ipplatform.backend.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            jwtUtil.validateAccessToken(token);

            String username    = jwtUtil.extractUsername(token);
            String role        = jwtUtil.extractRole(token);       // e.g. "ROLE_ANALYST"
            String subjectType = jwtUtil.extractSubjectType(token); // "USER"|"ANALYST"|"ADMIN"

            // Role already contains "ROLE_" prefix — do NOT add it again
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                            username, null,
                            List.of(new SimpleGrantedAuthority(role))
                    );
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (ExpiredJwtException e) {
            writeError(response, "Token expired", "TOKEN_EXPIRED");
            return;
        } catch (JwtException e) {
            writeError(response, "Invalid token", "TOKEN_INVALID");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void writeError(HttpServletResponse response, String msg, String code) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"" + msg + "\",\"code\":\"" + code + "\"}");
    }
}