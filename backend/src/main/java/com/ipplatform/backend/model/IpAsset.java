package com.ipplatform.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ip_assets")
public class IpAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type;

    @Column(name = "asset_number")
    private String assetNumber;

    private String title;

    private String assignee;

    private String inventor;

    private String jurisdiction;

    @Column(name = "filing_date")
    private LocalDateTime filingDate;

    private String status;

    @Column(name = "class")
    private String className;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "api_source")
    private String apiSource;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    public IpAsset() {}

    // Getters & Setters

    public Long getId() { return id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getAssetNumber() { return assetNumber; }
    public void setAssetNumber(String assetNumber) { this.assetNumber = assetNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAssignee() { return assignee; }
    public void setAssignee(String assignee) { this.assignee = assignee; }

    public String getInventor() { return inventor; }
    public void setInventor(String inventor) { this.inventor = inventor; }

    public String getJurisdiction() { return jurisdiction; }
    public void setJurisdiction(String jurisdiction) { this.jurisdiction = jurisdiction; }

    public LocalDateTime getFilingDate() { return filingDate; }
    public void setFilingDate(LocalDateTime filingDate) { this.filingDate = filingDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getApiSource() { return apiSource; }
    public void setApiSource(String apiSource) { this.apiSource = apiSource; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}