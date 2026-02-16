package com.geosapiens.backend.assets;

import com.geosapiens.backend.assets.dto.AssetUpsertRequest;
import com.geosapiens.backend.assets.exceptions.AssetNotFoundException;
import com.geosapiens.backend.assets.exceptions.SerialNumberConflictException;
import java.sql.SQLException;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AssetService {

  private static final String POSTGRES_UNIQUE_VIOLATION_SQLSTATE = "23505";
  private static final String ASSETS_SERIAL_NUMBER_UK = "assets_serial_number_uk";

  private final AssetRepository assetRepository;

  public AssetService(AssetRepository assetRepository) {
    this.assetRepository = assetRepository;
  }

  @Transactional(readOnly = true)
  public Asset getById(Long id) {
    return assetRepository.findById(id).orElseThrow(() -> new AssetNotFoundException(id));
  }

  @Transactional(readOnly = true)
  public Page<Asset> search(Category category, Status status, String q, Pageable pageable) {
    Specification<Asset> spec =
        Specification.where(AssetSpecifications.hasCategory(category))
            .and(AssetSpecifications.hasStatus(status))
            .and(AssetSpecifications.matchesQuery(q));

    return assetRepository.findAll(spec, pageable);
  }

  @Transactional
  public Asset create(AssetUpsertRequest request) {
    if (assetRepository.existsBySerialNumber(request.serialNumber())) {
      throw new SerialNumberConflictException(request.serialNumber());
    }

    var asset = new Asset();
    applyUpsertRequest(asset, request);

    try {
      return assetRepository.saveAndFlush(asset);
    } catch (DataIntegrityViolationException ex) {
      if (isUniqueViolation(ex)) {
        throw new SerialNumberConflictException(request.serialNumber(), ex);
      }
      throw ex;
    }
  }

  @Transactional
  public Asset update(Long id, AssetUpsertRequest request) {
    var asset = getById(id);

    if (assetRepository.existsBySerialNumberAndIdNot(request.serialNumber(), id)) {
      throw new SerialNumberConflictException(request.serialNumber());
    }

    applyUpsertRequest(asset, request);

    try {
      return assetRepository.saveAndFlush(asset);
    } catch (DataIntegrityViolationException ex) {
      if (isUniqueViolation(ex)) {
        throw new SerialNumberConflictException(request.serialNumber(), ex);
      }
      throw ex;
    }
  }

  @Transactional
  public void delete(Long id) {
    if (!assetRepository.existsById(id)) {
      throw new AssetNotFoundException(id);
    }
    assetRepository.deleteById(id);
  }

  private static void applyUpsertRequest(Asset asset, AssetUpsertRequest request) {
    asset.setName(request.name());
    asset.setSerialNumber(request.serialNumber());
    asset.setCategory(request.category());
    asset.setStatus(request.status());
    asset.setAcquisitionDate(request.acquisitionDate());
  }

  private static boolean isUniqueViolation(Throwable ex) {
    for (Throwable cur = ex; cur != null; cur = cur.getCause()) {
      if (cur instanceof ConstraintViolationException cve) {
        if (ASSETS_SERIAL_NUMBER_UK.equalsIgnoreCase(cve.getConstraintName())) {
          return true;
        }
      }

      if (cur instanceof SQLException sqlEx) {
        if (POSTGRES_UNIQUE_VIOLATION_SQLSTATE.equals(sqlEx.getSQLState())) {
          return true;
        }
      }
    }

    return false;
  }
}
