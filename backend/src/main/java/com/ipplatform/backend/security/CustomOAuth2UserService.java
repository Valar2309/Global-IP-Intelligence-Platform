package com.ipplatform.backend.security;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

/**
 * Called by Spring Security after Google returns the user's profile.
 *
 * This class only validates the OAuth2 response.
 * User creation / DB provisioning happens in AuthService.provisionOAuthUser()
 * which is called from OAuth2AuthenticationSuccessHandler — keeping this thin.
 *
 * NO User constructor is called here — that was the bug.
 */
@Component
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {

        // Let Spring Security load the standard Google profile attributes
        // (email, name, sub, picture, etc.)
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // Validate we received an email — required for our user provisioning
        String email = oAuth2User.getAttribute("email");
        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException(
                "No email returned from Google. " +
                "Ensure 'email' scope is configured in application.properties.");
        }

        // Validate we received a Google user ID (sub)
        String googleId = oAuth2User.getAttribute("sub");
        if (googleId == null || googleId.isBlank()) {
            throw new OAuth2AuthenticationException(
                "No user ID (sub) returned from Google.");
        }

        // Return the standard OAuth2User — Spring passes this to
        // OAuth2AuthenticationSuccessHandler.onAuthenticationSuccess()
        // where AuthService.provisionOAuthUser() creates/updates the DB record
        return oAuth2User;
    }
}