package com.ipplatform.backend.config;

import com.ipplatform.backend.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.Customizer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @org.springframework.beans.factory.annotation.Value("${app.frontend-url}")
    private String frontendUrl;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ✅ SECURE CORS CONFIGURATION
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Support multiple comma-separated origins (e.g. Production,Localhost)
        if (frontendUrl != null && !frontendUrl.isBlank()) {
            List<String> origins = Arrays.asList(frontendUrl.split(","));
            configuration.setAllowedOrigins(origins);
        }

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Requested-With", "Origin"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET,  "/api/user/profile").hasRole("USER")
                        .requestMatchers(HttpMethod.PUT,  "/api/user/profile").hasRole("USER")

                        .requestMatchers(HttpMethod.GET,  "/api/analyst/profile").hasRole("ANALYST")
                        .requestMatchers(HttpMethod.PUT,  "/api/analyst/profile").hasRole("ANALYST")

                        .requestMatchers(HttpMethod.GET,  "/api/admin/profile").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,  "/api/admin/profile").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/admin/change-password").hasRole("ADMIN")

                        // ── Public Endpoints ─────────────────────────
                        .requestMatchers(HttpMethod.POST, "/api/user/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/user/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/user/refresh").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/user/google").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/user/forgot-password").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/user/reset-password").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/analyst/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/analyst/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/analyst/refresh").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/admin/login").permitAll()

                        .requestMatchers("/actuator/health").permitAll()

                        // 🔥 Search + Detail API PUBLIC
                        .requestMatchers(HttpMethod.GET, "/api/search/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/assets/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/ip-assets/**").permitAll()

                        // 🔥 ADD THIS LINE (YOUR FIX)
                        .requestMatchers(HttpMethod.GET, "/api/visualization/**").permitAll()

                        // ── Legal Status API ─────────────────────────────
                        .requestMatchers(HttpMethod.GET, "/api/legal-status/summary").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/legal-status/pipeline").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/legal-status/alerts").hasAnyRole("ANALYST", "ADMIN")

                        // ── ROLE_USER ────────────────────────────────
                        .requestMatchers(HttpMethod.POST, "/api/user/logout").hasRole("USER")
                        .requestMatchers(HttpMethod.POST, "/api/user/change-password").hasRole("USER")
                        .requestMatchers(HttpMethod.GET, "/api/user/me").hasRole("USER")

                        // ── ROLE_ANALYST ─────────────────────────────
                        .requestMatchers(HttpMethod.POST, "/api/analyst/logout").hasRole("ANALYST")
                        .requestMatchers(HttpMethod.GET, "/api/analyst/me").hasRole("ANALYST")
                        .requestMatchers("/api/subscriptions/**")
                        .hasAnyRole("USER", "ANALYST", "ADMIN")
                        .requestMatchers("/api/notifications/**")
                        .hasAnyRole("ANALYST", "ADMIN")
                        .requestMatchers("/api/landscape/**")
                        .hasAnyRole("ANALYST", "ADMIN")
                        .requestMatchers("/api/filings/**")
                        .hasAnyRole("ANALYST", "ADMIN")

                        // ── ROLE_ADMIN ───────────────────────────────
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        .anyRequest().authenticated()
                )

                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}