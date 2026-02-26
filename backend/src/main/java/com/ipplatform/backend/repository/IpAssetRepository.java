package com.ipplatform.backend.repository;

import com.ipplatform.backend.model.IpAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface IpAssetRepository
        extends JpaRepository<IpAsset, Long>,
                JpaSpecificationExecutor<IpAsset> {
}