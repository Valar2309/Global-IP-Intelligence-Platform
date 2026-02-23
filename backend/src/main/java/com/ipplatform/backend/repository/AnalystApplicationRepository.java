package com.ipplatform.backend.repository;

import com.ipplatform.backend.model.AnalystApplication;
import com.ipplatform.backend.model.AnalystApplication.ApplicationStatus;
import com.ipplatform.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AnalystApplicationRepository extends JpaRepository<AnalystApplication, Long> {

    Optional<AnalystApplication> findByUser(User user);

    Optional<AnalystApplication> findByUserId(Long userId);

    List<AnalystApplication> findByStatus(ApplicationStatus status);

    List<AnalystApplication> findByStatusOrderByCreatedAtAsc(ApplicationStatus status);

    boolean existsByUser(User user);
}