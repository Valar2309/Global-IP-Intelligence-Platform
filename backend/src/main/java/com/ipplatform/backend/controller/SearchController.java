package com.ipplatform.backend.controller;

import com.ipplatform.backend.model.Patent;
import com.ipplatform.backend.service.SearchService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/legacy")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/search")
    public List<Patent> searchPatents(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String inventor,
            @RequestParam(required = false) String assignee,
            @RequestParam(required = false) String jurisdiction
    ) {
        return searchService.search(keyword, inventor, assignee, jurisdiction);
    }
}