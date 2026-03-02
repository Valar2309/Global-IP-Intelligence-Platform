package com.ipplatform.backend.service;

import com.ipplatform.backend.repository.IpAssetRepository;
import com.ipplatform.backend.model.IpAsset;
import com.ipplatform.backend.dto.IpAssetSummaryDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class IpAssetService {

    @Autowired
    private IpAssetRepository repository;

    // 🔎 Search with pagination
    public Page<IpAssetSummaryDTO> search(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return repository.searchAssets(keyword, pageable);
    }

    // ➕ Save new IP Asset
    public IpAsset save(IpAsset asset) {
        return repository.save(asset);
    }

    // 📄 Get full details by ID
    public IpAsset getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("IP Asset not found"));
    }
}