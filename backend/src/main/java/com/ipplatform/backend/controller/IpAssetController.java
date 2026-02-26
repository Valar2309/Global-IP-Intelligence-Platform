package com.ipplatform.backend.controller;

import com.ipplatform.backend.model.IpAsset;
import com.ipplatform.backend.repository.IpAssetRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/ip-assets")
public class IpAssetController {

    private final IpAssetRepository ipAssetRepository;

    public IpAssetController(IpAssetRepository ipAssetRepository) {
        this.ipAssetRepository = ipAssetRepository;
    }

    // ✅ STORE (Create IP Asset)
    @PostMapping
    public IpAsset createIpAsset(@RequestBody IpAsset ipAsset) {
        ipAsset.setLastUpdated(LocalDateTime.now());
        return ipAssetRepository.save(ipAsset);
    }

    // ✅ DISPLAY ALL
    @GetMapping
    public List<IpAsset> getAllIpAssets() {
        return ipAssetRepository.findAll();
    }
    @GetMapping("/{id}")
public ResponseEntity<IpAsset> getById(@PathVariable Long id) {
    return ipAssetRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}

}