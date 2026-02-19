package com.ipplatform.backend.config;

import com.ipplatform.backend.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Central Spring Security configuration.
 *
 * Role hierarchy (additive – each role inherits lower-level permissions):
 *
 *   ROLE_ADMIN   – full access, including admin-only endpoints
 *   ROLE_ANALYST – can read/search IP assets, manage subscriptions/notifications
 *   ROLE_USER    – basic access: login, view own profile, public search
 *
 * Endpoint → role mapping:
 * ┌────────────────────────────────┬───────────────────────────────┐
 * │ Endpoint prefix                │ Minimum role required         │
 * ├────────────────────────────────┼───────────────────────────────┤
 * │ POST /auth/**                  │ Public (no auth)              │
 * │ GET  /api/search/**            │ ROLE_USER                     │
 * │ GET  /api/ip-assets/**         │ ROLE_USER                     │
 * │ GET  /api/landscape/**         │ ROLE_ANALYST                  │
 * │ ANY  /api/subscriptions/**     │ ROLE_ANALYST                  │
 * │ ANY  /api/notifications/**     │ ROLE_ANALYST                  │
 * │ ANY  /api/admin/**             │ ROLE_ADMIN                    │
 * │ ANY  /api/users/**             │ ROLE_ADMIN                    │
 * └────────────────────────────────┴───────────────────────────────┘
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity          // enables @PreAuthorize / @Secured on controllers
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Stateless REST API – no CSRF, no sessions
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests(auth -> auth

                // ── Public ──────────────────────────────────────────────────
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/oauth2/**").permitAll()      // OAuth2 callback
                .requestMatchers("/actuator/health").permitAll()

                // ── ROLE_USER (any authenticated user) ──────────────────────
                .requestMatchers(HttpMethod.GET, "/api/search/**").hasAnyRole("USER", "ANALYST", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/ip-assets/**").hasAnyRole("USER", "ANALYST", "ADMIN")

                // ── ROLE_ANALYST (analysts + admins) ────────────────────────
                .requestMatchers("/api/landscape/**").hasAnyRole("ANALYST", "ADMIN")
                .requestMatchers("/api/subscriptions/**").hasAnyRole("ANALYST", "ADMIN")
                .requestMatchers("/api/notifications/**").hasAnyRole("ANALYST", "ADMIN")
                .requestMatchers("/api/filings/**").hasAnyRole("ANALYST", "ADMIN")

                // ── ROLE_ADMIN only ──────────────────────────────────────────
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/users/**").hasRole("ADMIN")

                // ── Everything else requires authentication ──────────────────
                .anyRequest().authenticated()
            )

            // Wire in the JWT filter before Spring's default auth filter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}