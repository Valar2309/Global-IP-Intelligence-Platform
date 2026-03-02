package com.ipplatform.backend.dto;

public class IpAssetSummaryDTO {

    private Long id;
    private String title;
    private String inventor;
    private String jurisdiction;
    private String status;

    public IpAssetSummaryDTO(Long id, String title,
                             String inventor,
                             String jurisdiction,
                             String status) {
        this.id = id;
        this.title = title;
        this.inventor = inventor;
        this.jurisdiction = jurisdiction;
        this.status = status;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getInventor() { return inventor; }
    public String getJurisdiction() { return jurisdiction; }
    public String getStatus() { return status; }
}