package com.geosapiens.backend.assets.dto;

import com.geosapiens.backend.assets.Category;
import com.geosapiens.backend.assets.Status;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record AssetUpsertRequest(
    @NotBlank @Size(max = 255) String name,
    @NotBlank @Size(max = 128) String serialNumber,
    @NotNull Category category,
    @NotNull Status status,
    @NotNull @PastOrPresent LocalDate acquisitionDate) {}

