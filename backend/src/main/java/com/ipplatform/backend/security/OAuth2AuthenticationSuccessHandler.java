package com.ipplatform.backend.security;

import com.ipplatform.backend.model.RefreshToken;
import com.ipplatform.backend.model.User;
import com.ipplatform.backend.repository.RefreshTokenRepository;
import com.ipplatform.backend.repository.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * Triggered after Google successfully authenticates the user.
 *
 * Flow:
 *   Google callback → Spring processes OAuth → THIS HANDLER runs
 *   → generates JWT access + refresh tokens
 *   → persists refresh token in DB
 *   → redirects to frontend with tokens in URL params
 *   → frontend stores tokens and treats user as logged in
 */
@Component
public class OAuth2AuthenticationSuccessHandler
        extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${oauth2.redirect-uri:http://localhost:3000/oauth2/callback}")
    private String redirectUri;

    @Value("${auth.refresh-token-expiry-days:7}")
    private int refreshDays;

    public OAuth2AuthenticationSuccessHandler(JwtUtil jwtUtil,
                                              UserRepository userRepository,
                                              RefreshTokenRepository refreshTokenRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("OAuth user not found after authentication"));

        // Generate JWT tokens using the correct signature
        String accessToken  = jwtUtil.generateAccessToken(user.getUsername(), "ROLE_USER", "USER");
        String rawRefresh   = jwtUtil.generateRefreshToken(user.getUsername());

        // Persist refresh token to DB
        Instant expiresAt = Instant.now().plus(refreshDays, ChronoUnit.DAYS);
        RefreshToken rt = new RefreshToken(rawRefresh, "USER", user.getId(),
                user.getUsername(), expiresAt, false);
        refreshTokenRepository.save(rt);

        String targetUrl = redirectUri
                + "?accessToken="  + URLEncoder.encode(accessToken, StandardCharsets.UTF_8)
                + "&refreshToken=" + URLEncoder.encode(rawRefresh,  StandardCharsets.UTF_8);

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
