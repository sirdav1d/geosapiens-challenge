package com.geosapiens.backend.assets.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record ApiErrorResponse(
    OffsetDateTime timestamp,
    int status,
    String code,
    String message,
    String path,
    List<ApiFieldError> errors) {

  public static ApiErrorResponse of(
      int status,
      String code,
      String message,
      String path,
      List<ApiFieldError> errors) {
    return new ApiErrorResponse(OffsetDateTime.now(), status, code, message, path, errors);
  }

  public record ApiFieldError(String field, String message, String rejectedValue) {
  }
}
