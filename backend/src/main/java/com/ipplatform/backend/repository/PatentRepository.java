package com.ipplatform.backend.repository;

import com.ipplatform.backend.model.Patent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatentRepository extends JpaRepository<Patent, Long> {

    @Query("""
        SELECT p FROM Patent p
        WHERE
        (:keyword IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
        AND (:inventor IS NULL OR LOWER(p.inventor) LIKE LOWER(CONCAT('%', :inventor, '%')))
        AND (:assignee IS NULL OR LOWER(p.assignee) LIKE LOWER(CONCAT('%', :assignee, '%')))
        AND (:jurisdiction IS NULL OR LOWER(p.jurisdiction) LIKE LOWER(CONCAT('%', :jurisdiction, '%')))
    """)
    List<Patent> searchPatents(
            @Param("keyword") String keyword,
            @Param("inventor") String inventor,
            @Param("assignee") String assignee,
            @Param("jurisdiction") String jurisdiction
    );
}