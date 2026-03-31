package com.ipplatform.backend.ip.controller;

import com.ipplatform.backend.ip.service.VisualizationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/visualization")
public class VisualizationController {

    private final VisualizationService service;

    public VisualizationController(VisualizationService service) {
        this.service = service;
    }

    @GetMapping("/trends")
    public ResponseEntity<?> trends(@RequestParam String keyword) {
        return ResponseEntity.ok(service.getTrends(keyword));
    }

    @GetMapping("/citations")
    public ResponseEntity<?> citations(@RequestParam String keyword) {
        return ResponseEntity.ok(service.getCitations(keyword));
    }

    @GetMapping("/families")
    public ResponseEntity<?> families(@RequestParam String keyword) {
        return ResponseEntity.ok(service.getFamilies(keyword));
    }
}