package com.geosapiens.backend.assets.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class AssetNotFoundException extends RuntimeException {

  public AssetNotFoundException(Long id) {
    super("Asset não encontrado: id=" + id);
  }
}

