package com.ipplatform.backend.config;

import com.ipplatform.backend.security.JwtAuthenticationFilter;
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
 * Security configuration with fully separated endpoints per role.
 *
 * PUBLIC (no JWT required):
 *   POST /api/user/register
 *   POST /api/user/login
 *   POST /api/user/refresh
 *   POST /api/analyst/register
 *   POST /api/analyst/login
 *   POST /api/analyst/refresh
 *   POST /api/admin/login
 *
 * ROLE_USER required:
 *   POST /api/user/logout
 *   GET  /api/search/**
 *   GET  /api/ip-assets/**
 *
 * ROLE_ANALYST required:
 *   POST /api/analyst/logout
 *   GET  /api/landscape/**
 *   ANY  /api/subscriptions/**
 *   ANY  /api/notifications/**
 *   ANY  /api/filings/**
 *
 * ROLE_ADMIN required:
 *   GET/POST /api/admin/analysts/**
 *   ANY /api/admin/**  (except /api/admin/login)
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests(auth -> auth

                // ── Public: no JWT needed ──────────────────────────────────────────────
                .requestMatchers(HttpMethod.POST, "/api/user/register").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/user/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/user/refresh").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/user/forgot-password").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/user/reset-password").permitAll()

                .requestMatchers(HttpMethod.POST, "/api/analyst/register").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/analyst/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/analyst/refresh").permitAll()

                .requestMatchers(HttpMethod.POST, "/api/admin/login").permitAll()

                .requestMatchers("/actuator/health").permitAll()

                // ── ROLE_USER ──────────────────────────────────────────────────────
                .requestMatchers(HttpMethod.POST, "/api/user/logout").hasRole("USER")
                .requestMatchers(HttpMethod.POST, "/api/user/change-password").hasRole("USER")
                .requestMatchers(HttpMethod.GET,  "/api/user/me").hasRole("USER")
                .requestMatchers(HttpMethod.GET,  "/api/search/**").hasAnyRole("USER", "ANALYST", "ADMIN")
                .requestMatchers(HttpMethod.GET,  "/api/ip-assets/**").hasAnyRole("USER", "ANALYST", "ADMIN")

                // ── ROLE_ANALYST ───────────────────────────────────────────────────
                .requestMatchers(HttpMethod.POST, "/api/analyst/logout").hasRole("ANALYST")
                .requestMatchers(HttpMethod.GET,  "/api/analyst/me").hasRole("ANALYST")
                .requestMatchers("/api/subscriptions/**").hasAnyRole("ANALYST", "ADMIN")
                .requestMatchers("/api/notifications/**").hasAnyRole("ANALYST", "ADMIN")
                .requestMatchers("/api/landscape/**").hasAnyRole("ANALYST", "ADMIN")
                .requestMatchers("/api/filings/**").hasAnyRole("ANALYST", "ADMIN")

                // ── ROLE_ADMIN ─────────────────────────────────────────────────────
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}