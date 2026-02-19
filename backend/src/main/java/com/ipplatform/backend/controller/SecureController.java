package com.ipplatform.backend.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

/**
 * Example controller showing role-gated endpoints.
 *
 * Three levels:
 *   /secure/user    – any authenticated user (ROLE_USER, ROLE_ANALYST, ROLE_ADMIN)
 *   /secure/analyst – ROLE_ANALYST or ROLE_ADMIN
 *   /secure/admin   – ROLE_ADMIN only
 */
@RestController
@RequestMapping("/secure")
public class SecureController {

    /** Accessible by every authenticated user. */
    @GetMapping("/user")
    @PreAuthorize("hasAnyRole('USER', 'ANALYST', 'ADMIN')")
    public String userEndpoint(Principal principal) {
        return "Hello " + principal.getName() + " — you have at least USER access.";
    }

    /** Accessible by analysts and admins. */
    @GetMapping("/analyst")
    @PreAuthorize("hasAnyRole('ANALYST', 'ADMIN')")
    public String analystEndpoint(Principal principal) {
        return "Hello " + principal.getName() + " — you have ANALYST access.";
    }

    /** Accessible by admins only. */
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminEndpoint(Principal principal) {
        return "Hello " + principal.getName() + " — you have ADMIN access.";
    }

    // Legacy endpoint kept for backwards compatibility
    @GetMapping("/hello")
    @PreAuthorize("isAuthenticated()")
    public String hello() {
        return "You accessed a protected endpoint!";
    }
}