package com.ipplatform.backend.config;

import com.ipplatform.backend.repository.PasswordResetTokenRepository;
import com.ipplatform.backend.repository.RefreshTokenRepository;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;

/**
 * Cleans up expired tokens from the DB on a schedule.
 * Prevents the refresh_tokens and password_reset_tokens tables from growing forever.
 *
 * Add @EnableScheduling to your main Application class, or it's here via @EnableScheduling.
 */
@Component
@EnableScheduling
public class TokenCleanupScheduler {

    private final RefreshTokenRepository    refreshTokenRepository;
    private final PasswordResetTokenRepository resetTokenRepository;

    public TokenCleanupScheduler(RefreshTokenRepository refreshTokenRepository,
                                  PasswordResetTokenRepository resetTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.resetTokenRepository   = resetTokenRepository;
    }

    /** Runs every day at 2:00 AM. */
    @Scheduled(cron = "0 0 2 * * *")
    public void cleanupExpiredTokens() {
        Instant now = Instant.now();
        refreshTokenRepository.deleteExpiredAndRevoked(now);
        resetTokenRepository.deleteExpiredAndUsed(now);
        System.out.println("🧹 Token cleanup completed at " + now);
    }
}