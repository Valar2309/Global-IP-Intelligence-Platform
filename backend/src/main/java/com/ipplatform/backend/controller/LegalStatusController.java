package com.ipplatform.backend.controller;

import com.ipplatform.backend.dto.LegalStatusSummaryDTO;
import com.ipplatform.backend.model.IpAsset;
import com.ipplatform.backend.service.LegalStatusService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/legal-status")
public class LegalStatusController {

    private final LegalStatusService legalStatusService;

    public LegalStatusController(LegalStatusService legalStatusService) {
        this.legalStatusService = legalStatusService;
    }

    @GetMapping("/summary")
    public LegalStatusSummaryDTO getSummary() {
        return legalStatusService.getSummary();
    }

    @GetMapping("/alerts")
    public Map<String, List<IpAsset>> getAlerts() {
        return legalStatusService.getAlerts();
    }

    @GetMapping("/pipeline")
    public Map<String, Object> getPipeline() {
        return legalStatusService.getPipeline();
    }
}
