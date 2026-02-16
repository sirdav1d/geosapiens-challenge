package com.geosapiens.backend.assets.dto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.geosapiens.backend.assets.Category;
import com.geosapiens.backend.assets.Status;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import java.time.LocalDate;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;

class AssetUpsertRequestValidationTest {

  private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

  @Test
  void shouldAcceptValidRequest() {
    var request = new AssetUpsertRequest(
        "Notebook Dell Latitude",
        "SN-000123",
        Category.COMPUTER,
        Status.IN_USE,
        LocalDate.now());

    var violations = validator.validate(request);

    assertTrue(violations.isEmpty());
  }

  @Test
  void shouldRejectMissingRequiredFields() {
    var request = new AssetUpsertRequest(
        " ",
        "",
        null,
        null,
        null);

    var violations = validator.validate(request);
    var fields = violations.stream()
        .map(violation -> violation.getPropertyPath().toString())
        .collect(Collectors.toSet());

    assertEquals(
        Set.of("name", "serialNumber", "category", "status", "acquisitionDate"),
        fields);
  }

  @Test
  void shouldRejectFutureAcquisitionDate() {
    var request = new AssetUpsertRequest(
        "Monitor LG 27",
        "SN-000999",
        Category.PERIPHERAL,
        Status.IN_STOCK,
        LocalDate.now().plusDays(1));

    var violations = validator.validate(request);

    assertEquals(1, violations.size());
    assertEquals("acquisitionDate", violations.iterator().next().getPropertyPath().toString());
  }
}
