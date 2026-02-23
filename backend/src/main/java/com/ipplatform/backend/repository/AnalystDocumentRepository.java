package com.ipplatform.backend.repository;

import com.ipplatform.backend.model.AnalystDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnalystDocumentRepository extends JpaRepository<AnalystDocument, Long> {

    List<AnalystDocument> findByApplicationId(Long applicationId);

    void deleteByApplicationId(Long applicationId);
}