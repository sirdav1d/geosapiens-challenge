package com.geosapiens.backend.assets.seed;

import com.geosapiens.backend.assets.Asset;
import com.geosapiens.backend.assets.AssetRepository;
import com.geosapiens.backend.assets.Category;
import com.geosapiens.backend.assets.Status;
import java.time.Clock;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AssetSeedRunner implements ApplicationRunner {

  private static final Logger log = LoggerFactory.getLogger(AssetSeedRunner.class);

  private static final int DEFAULT_SEED_COUNT = 200;
  private static final int YEARS_BACK = 5;

  private final AssetRepository assetRepository;
  private final boolean seedEnabled;
  private final Clock clock;

  public AssetSeedRunner(
      AssetRepository assetRepository,
      @Value("${APP_SEED:false}") boolean seedEnabled) {
    this.assetRepository = assetRepository;
    this.seedEnabled = seedEnabled;
    this.clock = Clock.systemUTC();
  }

  @Override
  @Transactional
  public void run(ApplicationArguments args) {
    if (!seedEnabled) {
      log.info("Seed desabilitado (APP_SEED=false).");
      return;
    }

    long count = assetRepository.count();
    if (count > 0) {
      log.info("Seed ignorado: já existem {} assets cadastrados.", count);
      return;
    }

    List<Asset> assets = generate(DEFAULT_SEED_COUNT);
    assetRepository.saveAll(assets);
    assetRepository.flush();
    log.info("Seed concluído: {} assets criados.", assets.size());
  }

  private List<Asset> generate(int total) {
    Category[] categories = Category.values();
    Status[] statuses = Status.values();
    int combos = categories.length * statuses.length;

    LocalDate now = LocalDate.now(clock);
    int maxDaysBack = YEARS_BACK * 365;
    Random random = new Random(42);

    List<Asset> assets = new ArrayList<>(total);
    for (int i = 1; i <= total; i++) {
      int comboIndex = (i - 1) % combos;
      Category category = categories[comboIndex % categories.length];
      Status status = statuses[(comboIndex / categories.length) % statuses.length];

      int daysBack = random.nextInt(maxDaysBack + 1);
      LocalDate acquisitionDate = now.minusDays(daysBack);

      Asset asset = new Asset();
      asset.setCategory(category);
      asset.setStatus(status);
      asset.setAcquisitionDate(acquisitionDate);
      asset.setName(toSeedName(category, i));
      asset.setSerialNumber(toSeedSerialNumber(category, status, i));

      assets.add(asset);
    }

    return assets;
  }

  private static String toSeedName(Category category, int i) {
    String prefix =
        switch (category) {
          case COMPUTER -> "Computador";
          case PERIPHERAL -> "Periférico";
          case NETWORK_EQUIPMENT -> "Equipamento de rede";
          case SERVER_INFRA -> "Servidor";
          case MOBILE_DEVICE -> "Dispositivo móvel";
        };
    return prefix + " " + String.format("%03d", i);
  }

  private static String toSeedSerialNumber(Category category, Status status, int i) {
    return "GS-" + toCode(category) + "-" + toCode(status) + "-" + String.format("%04d", i);
  }

  private static String toCode(Category category) {
    return switch (category) {
      case COMPUTER -> "COM";
      case PERIPHERAL -> "PER";
      case NETWORK_EQUIPMENT -> "NET";
      case SERVER_INFRA -> "SRV";
      case MOBILE_DEVICE -> "MOB";
    };
  }

  private static String toCode(Status status) {
    return switch (status) {
      case IN_USE -> "USE";
      case IN_STOCK -> "STK";
      case MAINTENANCE -> "MNT";
      case RETIRED -> "RET";
    };
  }
}

