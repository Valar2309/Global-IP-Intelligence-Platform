package com.ipplatform.backend.security;

import com.ipplatform.backend.model.User;
import com.ipplatform.backend.repository.UserRepository;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * Called by Spring Security after Google successfully authenticates the user.
 * Responsibilities:
 *   1. Extract user info from Google's response
 *   2. Find or create the user in our DB
 *   3. Return an OAuth2User that Spring Security can work with
 */
@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {

        // Delegate to Spring's default loader to get Google's user attributes
        OAuth2User oAuth2User = super.loadUser(userRequest);

        Map<String, Object> attributes = oAuth2User.getAttributes();

        // Extract fields from Google's profile
        String providerId = (String) attributes.get("sub");   // Google's unique user ID
        String email      = (String) attributes.get("email");
        String name       = (String) attributes.get("name");
        String provider   = userRequest.getClientRegistration().getRegistrationId(); // "google"

        // Find existing user or create new one
        User user = userRepository.findByProviderAndProviderId(provider, providerId)
                .orElseGet(() -> createNewOAuthUser(email, name, provider, providerId));

        // Update name/email in case they changed in Google profile
        user.setName(name);
        user.setEmail(email);
        userRepository.save(user);

        return oAuth2User;
    }

    private User createNewOAuthUser(String email, String name,
                                    String provider, String providerId) {
        // Use email as username — unique and human-readable
        // If somehow email already exists as a local user, append provider to avoid collision
        String username = userRepository.existsByEmail(email)
                ? email + "_" + provider
                : email;

        User newUser = new User(username, email, name, provider, providerId,
                List.of("USER")); // All OAuth signups get USER role by default

        return userRepository.save(newUser);
    }
}