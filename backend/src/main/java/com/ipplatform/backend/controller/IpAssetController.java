package com.ipplatform.backend.controller;

import com.ipplatform.backend.model.IpAsset;
import com.ipplatform.backend.service.IpAssetService;
import com.ipplatform.backend.dto.IpAssetSummaryDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ip-assets")
@CrossOrigin
public class IpAssetController {

    @Autowired
    private IpAssetService service;

    // 🔎 Search with pagination
    @GetMapping
    public Page<IpAssetSummaryDTO> search(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return service.search(keyword, page, size);
    }

    // ➕ Store new IP
    @PostMapping
    public IpAsset save(@RequestBody IpAsset asset) {
        return service.save(asset);
    }

    // 📄 Full Detail
    @GetMapping("/{id}")
    public IpAsset getById(@PathVariable Long id) {
        return service.getById(id);
    }
}