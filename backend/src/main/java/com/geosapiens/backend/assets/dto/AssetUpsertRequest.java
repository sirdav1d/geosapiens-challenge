package com.geosapiens.backend.assets.dto;

import com.geosapiens.backend.assets.Category;
import com.geosapiens.backend.assets.Status;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record AssetUpsertRequest(
    @NotBlank(message = "Nome é obrigatório.")
    @Size(max = 255, message = "Nome deve ter no máximo 255 caracteres.")
    String name,
    @NotBlank(message = "Número de série é obrigatório.")
    @Size(max = 128, message = "Número de série deve ter no máximo 128 caracteres.")
    String serialNumber,
    @NotNull(message = "Categoria é obrigatória.")
    Category category,
    @NotNull(message = "Status é obrigatório.")
    Status status,
    @NotNull(message = "Data de aquisição é obrigatória.")
    @PastOrPresent(message = "Data de aquisição não pode ser futura.")
    LocalDate acquisitionDate) {}
