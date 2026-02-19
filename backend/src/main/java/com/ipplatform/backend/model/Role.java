package com.ipplatform.backend.model;

/**
 * Application roles.
 * Stored as strings in the user_roles table (e.g. "ROLE_ADMIN").
 * Spring Security expects the "ROLE_" prefix for hasRole() checks.
 */
public enum Role {
    ROLE_ADMIN,
    ROLE_ANALYST,
    ROLE_USER;

    /** Convenience method – returns the enum name, which IS the stored string. */
    public String value() {
        return this.name();
    }
}