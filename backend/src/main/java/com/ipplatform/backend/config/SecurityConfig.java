package com.ipplatform.backend.config;

import com.ipplatform.backend.security.JwtAuthenticationFilter;
import com.ipplatform.backend.security.CustomOAuth2UserService;
import com.ipplatform.backend.security.OAuth2AuthenticationSuccessHandler;
import com.ipplatform.backend.security.OAuth2AuthenticationFailureHandler;

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
 * Complete Spring Security configuration.
 *
 * ┌─────────────────────────────────────────────┬─────────────┬───────────────────────────┐
 * │ URL                                         │ Auth        │ Roles                     │
 * ├─────────────────────────────────────────────┼─────────────┼───────────────────────────┤
 * │ POST /auth/register                         │ Public      │ —                         │
 * │ POST /auth/login                            │ Public      │ —                         │
 * │ POST /auth/refresh                          │ Public      │ —                         │
 * │ POST /auth/logout                           │ Public      │ —                         │
 * │ POST /auth/forgot-password                  │ Public      │ —                         │
 * │ POST /auth/reset-password                   │ Public      │ —                         │
 * │ GET  /oauth2/**  /login/**                  │ Public      │ OAuth2 flow               │
 * ├─────────────────────────────────────────────┼─────────────┼───────────────────────────┤
 * │ GET  /auth/me                               │ JWT         │ Any                       │
 * │ POST /auth/change-password                  │ JWT         │ Any                       │
 * │ POST /auth/logout-all                       │ JWT         │ Any                       │
 * │ ANY  /api/analyst/application/**            │ JWT         │ Any (incl. PENDING_DOC)   │
 * ├─────────────────────────────────────────────┼─────────────┼───────────────────────────┤
 * │ GET  /api/search/**                         │ JWT         │ USER, ANALYST, ADMIN      │
 * │ GET  /api/ip-assets/**                      │ JWT         │ USER, ANALYST, ADMIN      │
 * ├─────────────────────────────────────────────┼─────────────┼───────────────────────────┤
 * │ ANY  /api/subscriptions/**                  │ JWT         │ ANALYST, ADMIN            │
 * │ ANY  /api/notifications/**                  │ JWT         │ ANALYST, ADMIN            │
 * │ ANY  /api/landscape/**                      │ JWT         │ ANALYST, ADMIN            │
 * │ ANY  /api/filings/**                        │ JWT         │ ANALYST, ADMIN            │
 * ├─────────────────────────────────────────────┼─────────────┼───────────────────────────┤
 * │ ANY  /api/admin/**                          │ JWT         │ ADMIN only                │
 * │ ANY  /api/users/**                          │ JWT         │ ADMIN only                │
 * └─────────────────────────────────────────────┴─────────────┴───────────────────────────┘
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter            jwtAuthFilter;
    private final CustomOAuth2UserService            customOAuth2UserService;
    private final OAuth2AuthenticationSuccessHandler oAuth2SuccessHandler;
    private final OAuth2AuthenticationFailureHandler oAuth2FailureHandler;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter,
                          CustomOAuth2UserService customOAuth2UserService,
                          OAuth2AuthenticationSuccessHandler oAuth2SuccessHandler,
                          OAuth2AuthenticationFailureHandler oAuth2FailureHandler) {
        this.jwtAuthFilter        = jwtAuthFilter;
        this.customOAuth2UserService = customOAuth2UserService;
        this.oAuth2SuccessHandler = oAuth2SuccessHandler;
        this.oAuth2FailureHandler = oAuth2FailureHandler;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests(auth -> auth

                // ── Fully public — no JWT needed ──────────────────────────────
                .requestMatchers(
                    "/auth/register",
                    "/auth/login",
                    "/auth/refresh",
                    "/auth/logout",
                    "/auth/forgot-password",
                    "/auth/reset-password"
                ).permitAll()
                .requestMatchers("/oauth2/**").permitAll()
                .requestMatchers("/login/**").permitAll()         // Spring OAuth2 internals
                .requestMatchers("/actuator/health").permitAll()

                // ── Any authenticated user ─────────────────────────────────────
                // Includes analysts in PENDING_DOCUMENT status uploading their docs
                .requestMatchers("/auth/me").authenticated()
                .requestMatchers("/auth/change-password").authenticated()
                .requestMatchers("/auth/logout-all").authenticated()
                .requestMatchers("/api/analyst/application/**").authenticated()  // ← document upload

                // ── ROLE_USER and above ────────────────────────────────────────
                .requestMatchers(HttpMethod.GET, "/api/search/**")
                        .hasAnyRole("USER", "ANALYST", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/ip-assets/**")
                        .hasAnyRole("USER", "ANALYST", "ADMIN")

                // ── ROLE_ANALYST and above ─────────────────────────────────────
                .requestMatchers("/api/subscriptions/**").hasAnyRole("ANALYST", "ADMIN")
                .requestMatchers("/api/notifications/**").hasAnyRole("ANALYST", "ADMIN")
                .requestMatchers("/api/landscape/**").hasAnyRole("ANALYST", "ADMIN")
                .requestMatchers("/api/filings/**").hasAnyRole("ANALYST", "ADMIN")

                // ── ROLE_ADMIN only ────────────────────────────────────────────
                // Covers /api/admin/analyst-applications/** too
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/users/**").hasRole("ADMIN")

                .anyRequest().authenticated()
            )

            // ── JWT filter ────────────────────────────────────────────────────
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

            // ── Google OAuth2 ─────────────────────────────────────────────────
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService)
                )
                .successHandler(oAuth2SuccessHandler)
                .failureHandler(oAuth2FailureHandler)
            );

        return http.build();
    }
}