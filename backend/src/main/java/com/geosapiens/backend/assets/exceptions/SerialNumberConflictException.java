package com.geosapiens.backend.assets.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class SerialNumberConflictException extends RuntimeException {

  public SerialNumberConflictException(String serialNumber) {
    super("Já existe um Asset com serialNumber='" + serialNumber + "'.");
  }

  public SerialNumberConflictException(String serialNumber, Throwable cause) {
    super("Já existe um Asset com serialNumber='" + serialNumber + "'.", cause);
  }
}

