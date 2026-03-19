package com.ipplatform.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "patents")
public class Patent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "VARCHAR(255)")
    private String title;

    @Column(columnDefinition = "VARCHAR(255)")
    private String keyword;

    @Column(columnDefinition = "VARCHAR(255)")
    private String inventor;

    @Column(columnDefinition = "VARCHAR(255)")
    private String assignee;

    @Column(columnDefinition = "VARCHAR(255)")
    private String jurisdiction;

    // Constructors
    public Patent() {}

    public Patent(String title, String keyword, String inventor, String assignee, String jurisdiction) {
        this.title = title;
        this.keyword = keyword;
        this.inventor = inventor;
        this.assignee = assignee;
        this.jurisdiction = jurisdiction;
    }

    // Getters & Setters
    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getKeyword() {
        return keyword;
    }

    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }

    public String getInventor() {
        return inventor;
    }

    public void setInventor(String inventor) {
        this.inventor = inventor;
    }

    public String getAssignee() {
        return assignee;
    }

    public void setAssignee(String assignee) {
        this.assignee = assignee;
    }

    public String getJurisdiction() {
        return jurisdiction;
    }

    public void setJurisdiction(String jurisdiction) {
        this.jurisdiction = jurisdiction;
    }
}