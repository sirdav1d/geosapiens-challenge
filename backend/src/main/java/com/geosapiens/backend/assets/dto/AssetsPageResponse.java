package com.geosapiens.backend.assets.dto;

import com.geosapiens.backend.assets.Asset;
import java.util.List;
import org.springframework.data.domain.Page;

public record AssetsPageResponse(
    List<AssetResponse> items, int page, int size, long totalElements, int totalPages) {

  public static AssetsPageResponse fromPage(Page<Asset> page) {
    var items = page.getContent().stream().map(AssetResponse::fromEntity).toList();
    return new AssetsPageResponse(
        items, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
  }
}

