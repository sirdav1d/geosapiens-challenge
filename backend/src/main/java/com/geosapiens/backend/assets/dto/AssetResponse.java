package com.geosapiens.backend.assets.dto;

import com.geosapiens.backend.assets.Asset;
import com.geosapiens.backend.assets.Category;
import com.geosapiens.backend.assets.Status;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record AssetResponse(
    Long id,
    String name,
    String serialNumber,
    Category category,
    Status status,
    LocalDate acquisitionDate,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt) {

  public static AssetResponse fromEntity(Asset asset) {
    return new AssetResponse(
        asset.getId(),
        asset.getName(),
        asset.getSerialNumber(),
        asset.getCategory(),
        asset.getStatus(),
        asset.getAcquisitionDate(),
        asset.getCreatedAt(),
        asset.getUpdatedAt());
  }
}

