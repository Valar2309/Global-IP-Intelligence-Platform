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

import java.util.List;

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

    // 🔥 CORS Configuration
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults()) // 🔥 IMPORTANT
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests(auth -> auth

                // ── Public ─────────────────────────────────────
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

                // ── ROLE_USER ─────────────────────────────────
                .requestMatchers(HttpMethod.POST, "/api/user/logout").hasRole("USER")
                .requestMatchers(HttpMethod.POST, "/api/user/change-password").hasRole("USER")
                .requestMatchers(HttpMethod.GET,  "/api/user/me").hasRole("USER")
                .requestMatchers(HttpMethod.GET,  "/api/search/**").hasAnyRole("USER", "ANALYST", "ADMIN")
                .requestMatchers(HttpMethod.GET,  "/api/ip-assets/**").hasAnyRole("USER", "ANALYST", "ADMIN")

                // ── ROLE_ANALYST ───────────────────────────────
                .requestMatchers(HttpMethod.POST, "/api/analyst/logout").hasRole("ANALYST")
                .requestMatchers(HttpMethod.GET,  "/api/analyst/me").hasRole("ANALYST")
                .requestMatchers("/api/subscriptions/**").hasAnyRole("ANALYST", "ADMIN")
                .requestMatchers("/api/notifications/**").hasAnyRole("ANALYST", "ADMIN")
                .requestMatchers("/api/landscape/**").hasAnyRole("ANALYST", "ADMIN")
                .requestMatchers("/api/filings/**").hasAnyRole("ANALYST", "ADMIN")

                // ── ROLE_ADMIN ────────────────────────────────
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}