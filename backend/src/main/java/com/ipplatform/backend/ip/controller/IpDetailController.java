package com.ipplatform.backend.ip.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.ipplatform.backend.ip.service.LensApiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Patent detail endpoints.
 *
 * GET /api/assets/{lensId} ← primary (matches frontend workflow spec)
 * GET /api/ip-assets/{lensId} ← alias (backward compat)
 *
 * Both are PUBLIC — see SecurityConfig (anonymously browsable after search).
 * Secured endpoints (bookmarks, history) can be added later.
 *
 * Response: full Lens.org patent object (biblio, abstract, legal_status,
 * description).
 */
@RestController
public class IpDetailController {

    private final LensApiService lensApiService;

    public IpDetailController(LensApiService lensApiService) {
        this.lensApiService = lensApiService;
    }

    /** Primary path — matches frontend workflow */
    @GetMapping("/api/assets/{lensId}")
    public ResponseEntity<JsonNode> getAsset(@PathVariable String lensId) {
        return ResponseEntity.ok(lensApiService.getPatentByLensId(lensId));
    }

    /** Alias for backward compatibility */
    @GetMapping("/api/ip-assets/{lensId}")
    public ResponseEntity<JsonNode> getIpAsset(@PathVariable String lensId) {
        return ResponseEntity.ok(lensApiService.getPatentByLensId(lensId));
    }
}
