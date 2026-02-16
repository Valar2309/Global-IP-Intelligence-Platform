package com.ipplatform.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtUtil jwtUtil;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2AuthenticationSuccessHandler oAuth2SuccessHandler;
    private final OAuth2AuthenticationFailureHandler oAuth2FailureHandler;

    public SecurityConfig(JwtUtil jwtUtil,
                          CustomOAuth2UserService customOAuth2UserService,
                          OAuth2AuthenticationSuccessHandler oAuth2SuccessHandler,
                          OAuth2AuthenticationFailureHandler oAuth2FailureHandler) {
        this.jwtUtil = jwtUtil;
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

            .authorizeHttpRequests(auth -> auth
                // Public endpoints — no token needed
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/oauth2/**").permitAll()
                .requestMatchers("/login/**").permitAll()  // Spring OAuth2 internal URLs

                // Role-restricted routes
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/analyst/**").hasAnyRole("ADMIN", "ANALYST")

                // Everything else requires a valid JWT
                .anyRequest().authenticated()
            )

            // ── JWT filter (for normal login and all subsequent requests) ──────────
            .addFilterBefore(
                new JwtAuthenticationFilter(jwtUtil),
                UsernamePasswordAuthenticationFilter.class
            )

            // ── Google OAuth2 login ───────────────────────────────────────────────
            .oauth2Login(oauth2 -> oauth2
                // Spring will auto-generate: GET /oauth2/authorization/google
                // That's the URL your frontend "Continue with Google" button hits
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService)  // our custom user loader
                )
                .successHandler(oAuth2SuccessHandler)      // generates JWT after Google auth
                .failureHandler(oAuth2FailureHandler)      // handles Google auth failures
            );

        return http.build();
    }
}