package com.geosapiens.backend.config;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

  private final List<String> allowedOrigins;

  public CorsConfig(@Value("${CORS_ALLOWED_ORIGINS:}") String allowedOrigins) {
    this.allowedOrigins = parseCsv(allowedOrigins);
  }

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    if (allowedOrigins.isEmpty()) {
      return;
    }

    registry
        .addMapping("/**")
        .allowedOrigins(allowedOrigins.toArray(String[]::new))
        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
        .allowedHeaders("*")
        .allowCredentials(false)
        .maxAge(3600);
  }

  private static List<String> parseCsv(String raw) {
    if (raw == null || raw.isBlank()) {
      return List.of();
    }

    return Arrays.stream(raw.split(",", -1))
        .map(String::trim)
        .filter(value -> !value.isBlank())
        .distinct()
        .collect(Collectors.toList());
  }
}
