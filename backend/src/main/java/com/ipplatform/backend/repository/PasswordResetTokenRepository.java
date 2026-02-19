package com.ipplatform.backend.repository;

import com.ipplatform.backend.model.PasswordResetToken;
import com.ipplatform.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    /** Delete all tokens for a user (called after successful password reset). */
    @Modifying
    @Transactional
    void deleteAllByUser(User user);

    /** Scheduled cleanup: delete expired tokens to keep the table clean. */
    @Modifying
    @Transactional
    @Query("DELETE FROM PasswordResetToken t WHERE t.expiresAt < :now OR t.used = true")
    void deleteExpiredAndUsed(Instant now);
}