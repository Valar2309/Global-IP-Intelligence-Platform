package com.ipplatform.backend.repository;

import com.ipplatform.backend.model.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    @Modifying
    @Query("UPDATE RefreshToken r SET r.revoked = true WHERE r.subjectType = :type AND r.subjectId = :id AND r.revoked = false")
    void revokeAllBySubject(String type, Long id);

    @Modifying
    @Query("DELETE FROM RefreshToken r WHERE r.revoked = true OR r.expiresAt < CURRENT_TIMESTAMP")
    void deleteExpiredAndRevoked();
}