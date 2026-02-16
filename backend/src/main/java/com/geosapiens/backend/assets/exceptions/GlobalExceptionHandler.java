package com.geosapiens.backend.assets.exceptions;

import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.geosapiens.backend.assets.dto.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.TypeMismatchException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice(basePackages = "com.geosapiens.backend")
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

  private static final String CODE_VALIDATION_ERROR = "VALIDATION_ERROR";
  private static final String CODE_INVALID_PARAMETER = "INVALID_PARAMETER";
  private static final String CODE_INVALID_REQUEST = "INVALID_REQUEST";
  private static final String CODE_NOT_FOUND = "ASSET_NOT_FOUND";
  private static final String CODE_SERIAL_NUMBER_CONFLICT = "SERIAL_NUMBER_CONFLICT";

  @Override
  protected ResponseEntity<Object> handleMethodArgumentNotValid(
      MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
    var errors = toApiFieldErrors(ex.getBindingResult().getFieldErrors(), ex.getBindingResult().getGlobalErrors());
    return buildResponse(
        request,
        HttpStatus.BAD_REQUEST,
        CODE_VALIDATION_ERROR,
        "Falha na validação da requisição.",
        errors);
  }

  @Override
  protected ResponseEntity<Object> handleHttpMessageNotReadable(
      HttpMessageNotReadableException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
    InvalidFormatException invalidFormat = findInvalidFormat(ex);

    if (invalidFormat != null) {
      String field = getFieldFromJsonPath(invalidFormat.getPath());
      String message = "Valor inválido para '" + field + "': " + safeToString(invalidFormat.getValue()) + ".";
      var error = new ApiErrorResponse.ApiFieldError(
          field, message, safeToString(invalidFormat.getValue()));
      return buildResponse(
          request,
          HttpStatus.BAD_REQUEST,
          CODE_VALIDATION_ERROR,
          "Corpo da requisição inválido.",
          List.of(error));
    }

    return buildResponse(
        request,
        HttpStatus.BAD_REQUEST,
        CODE_INVALID_REQUEST,
        "Corpo da requisição inválido.",
        List.of());
  }

  @Override
  protected ResponseEntity<Object> handleTypeMismatch(
      TypeMismatchException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
    ApiErrorResponse.ApiFieldError error = new ApiErrorResponse.ApiFieldError(
        safeFieldName(ex.getPropertyName()),
        "Tipo inválido para o parâmetro."
            + (ex.getRequiredType() != null
                ? " Esperado: " + ex.getRequiredType().getSimpleName() + "."
                : ""),
        safeToString(ex.getValue()));
    return buildResponse(
        request,
        HttpStatus.BAD_REQUEST,
        CODE_INVALID_PARAMETER,
        "Falha na validação de parâmetro.",
        List.of(error));
  }

  @ExceptionHandler(BindException.class)
  public ResponseEntity<ApiErrorResponse> handleBindException(BindException ex, HttpServletRequest request) {
    var errors = toApiFieldErrors(ex.getBindingResult().getFieldErrors(), ex.getBindingResult().getGlobalErrors());
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
        ApiErrorResponse.of(
            HttpStatus.BAD_REQUEST.value(),
            CODE_INVALID_PARAMETER,
            "Falha nos parâmetros da requisição.",
            request.getRequestURI(),
            errors));
  }

  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<ApiErrorResponse> handleResponseStatusException(
      ResponseStatusException ex, HttpServletRequest request) {
    HttpStatus status = ex.getStatusCode() instanceof HttpStatus httpStatus ? httpStatus : HttpStatus.BAD_REQUEST;
    String errorCode = status == HttpStatus.NOT_FOUND
        ? CODE_NOT_FOUND
        : status == HttpStatus.CONFLICT ? CODE_SERIAL_NUMBER_CONFLICT : CODE_INVALID_REQUEST;

    return ResponseEntity.status(status).body(
        ApiErrorResponse.of(
            status.value(),
            errorCode,
            ex.getReason() != null ? ex.getReason() : "Requisição inválida.",
            request.getRequestURI(),
            List.of()));
  }

  @ExceptionHandler(AssetNotFoundException.class)
  public ResponseEntity<ApiErrorResponse> handleAssetNotFound(
      AssetNotFoundException ex, HttpServletRequest request) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
        ApiErrorResponse.of(
            HttpStatus.NOT_FOUND.value(),
            CODE_NOT_FOUND,
            ex.getMessage(),
            request.getRequestURI(),
            List.of()));
  }

  @ExceptionHandler(SerialNumberConflictException.class)
  public ResponseEntity<ApiErrorResponse> handleSerialNumberConflict(
      SerialNumberConflictException ex, HttpServletRequest request) {
    return ResponseEntity.status(HttpStatus.CONFLICT).body(
        ApiErrorResponse.of(
            HttpStatus.CONFLICT.value(),
            CODE_SERIAL_NUMBER_CONFLICT,
            ex.getMessage(),
            request.getRequestURI(),
            List.of()));
  }

  private static ResponseEntity<Object> buildResponse(
      WebRequest request,
      HttpStatus status,
      String code,
      String message,
      List<ApiErrorResponse.ApiFieldError> errors) {
    return ResponseEntity.status(status).body(
        ApiErrorResponse.of(
            status.value(),
            code,
            message,
            requestPath(request),
            errors));
  }

  private static String requestPath(WebRequest request) {
    if (request instanceof ServletWebRequest servletRequest) {
      return servletRequest.getRequest().getRequestURI();
    }
    return request.getDescription(false).replace("uri=", "");
  }

  private static List<ApiErrorResponse.ApiFieldError> toApiFieldErrors(
      List<FieldError> fieldErrors, List<ObjectError> globalErrors) {
    var fields = fieldErrors.stream()
        .map(
            error -> new ApiErrorResponse.ApiFieldError(
                error.getField(),
                toMessage(error.getDefaultMessage()),
                safeToString(error.getRejectedValue())))
        .collect(Collectors.toList());

    var global = globalErrors.stream()
        .map(GlobalExceptionHandler::toApiFieldError)
        .collect(Collectors.toList());

    fields.addAll(global);
    return fields;
  }

  private static ApiErrorResponse.ApiFieldError toApiFieldError(ObjectError error) {
    return new ApiErrorResponse.ApiFieldError(
        "", toMessage(error.getDefaultMessage()), "");
  }

  private static String toMessage(String message) {
    return message != null ? message : "Campo inválido.";
  }

  private static String safeFieldName(String fieldName) {
    return fieldName != null && !fieldName.isBlank() ? fieldName : "campo";
  }

  private static String safeToString(Object value) {
    return value != null ? String.valueOf(value) : null;
  }

  private static String getFieldFromJsonPath(List<JsonMappingException.Reference> path) {
    if (path == null || path.isEmpty()) {
      return "payload";
    }

    JsonMappingException.Reference reference = path.get(path.size() - 1);
    if (reference.getFieldName() != null) {
      return reference.getFieldName();
    }
    if (reference.getIndex() >= 0) {
      return "index " + reference.getIndex();
    }

    return "payload";
  }

  private static InvalidFormatException findInvalidFormat(Throwable ex) {
    for (Throwable current = ex; current != null; current = current.getCause()) {
      if (current instanceof InvalidFormatException invalidFormat) {
        return invalidFormat;
      }
    }
    return null;
  }
}
