package com.ipplatform.backend.security;

import com.ipplatform.backend.model.User;
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

/**
 * Triggered after Google successfully authenticates the user.
 *
 * Flow:
 *   Google callback → Spring processes OAuth → THIS HANDLER runs
 *   → generates your JWT access + refresh tokens
 *   → redirects to frontend with tokens in URL params
 *   → frontend stores tokens and treats user as logged in
 */
@Component
public class OAuth2AuthenticationSuccessHandler
        extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    // Where to redirect the frontend after successful OAuth login
    // Set this in application.properties / .env
    @Value("${oauth2.redirect-uri:http://localhost:3000/oauth2/callback}")
    private String redirectUri;

    public OAuth2AuthenticationSuccessHandler(JwtUtil jwtUtil,
                                              UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        // Get email from Google's profile (we use email as username for OAuth users)
        String email = oAuth2User.getAttribute("email");

        // Load full user from DB to get roles
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("OAuth user not found after authentication"));

        // Generate YOUR JWT tokens — same ones used by normal login
        String accessToken  = jwtUtil.generateAccessToken(user.getUsername(), user.getRoles());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUsername());

        // Redirect to frontend with tokens as URL params
        // Frontend reads these, stores them, and proceeds like a normal login
        String targetUrl = redirectUri
                + "?accessToken="  + URLEncoder.encode(accessToken,  StandardCharsets.UTF_8)
                + "&refreshToken=" + URLEncoder.encode(refreshToken, StandardCharsets.UTF_8);

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}