package com.ipplatform.backend.ip.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when an external API (Lens.org) returns a non-2xx response or times
 * out.
 * GlobalExceptionHandler maps this to HTTP 502 Bad Gateway.
 */
@ResponseStatus(HttpStatus.BAD_GATEWAY)
public class ExternalApiException extends RuntimeException {

    private final String source;
    private final int statusCode;

    public ExternalApiException(String source, int statusCode, String message) {
        super(String.format("[%s] API error %d: %s", source, statusCode, message));
        this.source = source;
        this.statusCode = statusCode;
    }

    public ExternalApiException(String source, String message, Throwable cause) {
        super(String.format("[%s] %s", source, message), cause);
        this.source = source;
        this.statusCode = 502;
    }

    public String getSource() {
        return source;
    }

    public int getStatusCode() {
        return statusCode;
    }
}
