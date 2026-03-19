package com.ipplatform.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "ip_assets", indexes = {
        @Index(name = "idx_title", columnList = "title"),
        @Index(name = "idx_inventor", columnList = "inventor"),
        @Index(name = "idx_jurisdiction", columnList = "jurisdiction"),
        @Index(name = "idx_status", columnList = "status")
})
public class IpAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "VARCHAR(255)")
    private String title;

    @Column(columnDefinition = "VARCHAR(255)")
    private String inventor;

    @Column(columnDefinition = "VARCHAR(255)")
    private String jurisdiction;

    @Column(columnDefinition = "VARCHAR(255)")
    private String status;

    @Column(columnDefinition = "TEXT")
    private String description;

    public IpAsset() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getInventor() {
        return inventor;
    }

    public void setInventor(String inventor) {
        this.inventor = inventor;
    }

    public String getJurisdiction() {
        return jurisdiction;
    }

    public void setJurisdiction(String jurisdiction) {
        this.jurisdiction = jurisdiction;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}