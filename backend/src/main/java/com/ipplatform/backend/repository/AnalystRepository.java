package com.ipplatform.backend.repository;

import com.ipplatform.backend.model.Analyst;
import com.ipplatform.backend.model.Analyst.AnalystStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AnalystRepository extends JpaRepository<Analyst, Long> {
    Optional<Analyst> findByUsername(String username);
    Optional<Analyst> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    List<Analyst> findByStatusOrderByCreatedAtAsc(AnalystStatus status);
}