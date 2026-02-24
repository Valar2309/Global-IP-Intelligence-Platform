package com.ipplatform.backend.exception;

public class AuthException extends RuntimeException {
    public AuthException(String message) {
        super(message);
    }
}