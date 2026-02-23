package com.ipplatform.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.time.Instant;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── Auth failures → 401 ───────────────────────────────────────────────────────
    @ExceptionHandler({ BadCredentialsException.class, UsernameNotFoundException.class })
public ResponseEntity<Map<String, Object>> handleSecurityExceptions(Exception ex) {
    return buildError(HttpStatus.UNAUTHORIZED, "Invalid username or password");
}

    @ExceptionHandler(AuthException.class)
    public ResponseEntity<Map<String, Object>> handleAuthException(AuthException ex) {
        return buildError(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    // ── Generic fallback → 500 ────────────────────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        // Don't leak internal details to the client
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
    }

    // ── Helper ────────────────────────────────────────────────────────────────────

    private ResponseEntity<Map<String, Object>> buildError(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of(
                "status",    status.value(),
                "error",     status.getReasonPhrase(),
                "message",   message,
                "timestamp", Instant.now().toString()
        ));
    }
}