package com.geosapiens.backend.assets;

import java.util.Locale;
import org.springframework.data.jpa.domain.Specification;

public final class AssetSpecifications {

  private AssetSpecifications() {}

  public static Specification<Asset> hasCategory(Category category) {
    return (root, query, cb) -> category == null ? null : cb.equal(root.get("category"), category);
  }

  public static Specification<Asset> hasStatus(Status status) {
    return (root, query, cb) -> status == null ? null : cb.equal(root.get("status"), status);
  }

  public static Specification<Asset> matchesQuery(String q) {
    return (root, query, cb) -> {
      if (q == null || q.isBlank()) {
        return null;
      }

      String pattern = toContainsLikePattern(q);

      var name = cb.lower(root.get("name"));
      var serialNumber = cb.lower(root.get("serialNumber"));

      // Escapa padrões para não tratar o input do usuário como wildcard.
      return cb.or(cb.like(name, pattern, '\\'), cb.like(serialNumber, pattern, '\\'));
    };
  }

  private static String toContainsLikePattern(String q) {
    String s = q.trim().toLowerCase(Locale.ROOT);
    s = s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    return "%" + s + "%";
  }
}
