package com.geosapiens.backend.assets;

import com.geosapiens.backend.assets.dto.AssetResponse;
import com.geosapiens.backend.assets.dto.AssetUpsertRequest;
import com.geosapiens.backend.assets.dto.AssetsPageResponse;
import jakarta.validation.Valid;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/assets")
public class AssetController {

  private static final int DEFAULT_PAGE = 0;
  private static final int DEFAULT_SIZE = 10;
  private static final int MAX_SIZE = 100;

  private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
      "id",
      "name",
      "serialNumber",
      "category",
      "status",
      "acquisitionDate",
      "createdAt",
      "updatedAt");

  private final AssetService assetService;

  public AssetController(AssetService assetService) {
    this.assetService = assetService;
  }

  // GET
  @GetMapping
  public AssetsPageResponse list(
      @RequestParam(required = false) Category category,
      @RequestParam(required = false) Status status,
      @RequestParam(required = false) String q,
      @RequestParam(defaultValue = "" + DEFAULT_PAGE) int page,
      @RequestParam(defaultValue = "" + DEFAULT_SIZE) int size,
      @RequestParam(required = false, name = "sort") List<String> sort) {
    if (page < 0) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "`page` deve ser >= 0.");
    }
    if (size < 1) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "`size` deve ser >= 1.");
    }

    int effectiveSize = Math.min(size, MAX_SIZE);
    Sort effectiveSort = parseSort(sort);

    var pageable = PageRequest.of(page, effectiveSize, effectiveSort);
    var result = assetService.search(category, status, q, pageable);

    return AssetsPageResponse.fromPage(result);
  }

  // CREATE
  @PostMapping
  public ResponseEntity<AssetResponse> create(@Valid @RequestBody AssetUpsertRequest request) {
    var created = assetService.create(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(AssetResponse.fromEntity(created));
  }

  // UPDATE
  @PutMapping("/{id}")
  public AssetResponse update(
      @PathVariable Long id, @Valid @RequestBody AssetUpsertRequest request) {
    var updated = assetService.update(id, request);
    return AssetResponse.fromEntity(updated);
  }

  // DELETE
  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id) {
    assetService.delete(id);
  }

  // GET - SORTED
  private static Sort parseSort(List<String> sortParams) {
    if (sortParams == null || sortParams.isEmpty()) {
      return Sort.by(Sort.Order.desc("id"));
    }

    List<Sort.Order> orders = new ArrayList<>();
    for (String raw : sortParams) {
      if (raw == null || raw.isBlank()) {
        continue;
      }

      String[] parts = raw.split(",", -1);
      String property = parts[0].trim();

      if (property.isEmpty()) {
        continue;
      }

      if (!ALLOWED_SORT_FIELDS.contains(property)) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST, "Campo `sort` inválido: " + property);
      }

      Sort.Direction direction = Sort.Direction.ASC;
      if (parts.length >= 2 && !parts[1].isBlank()) {
        String dir = parts[1].trim().toUpperCase(Locale.ROOT);
        if ("ASC".equals(dir)) {
          direction = Sort.Direction.ASC;
        } else if ("DESC".equals(dir)) {
          direction = Sort.Direction.DESC;
        } else {
          throw new ResponseStatusException(
              HttpStatus.BAD_REQUEST, "Direção de `sort` inválida: " + parts[1].trim());
        }
      }

      orders.add(new Sort.Order(direction, property));
    }

    if (orders.isEmpty()) {
      return Sort.by(Sort.Order.desc("id"));
    }

    return Sort.by(orders);
  }
}
