package com.geosapiens.backend.assets;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.geosapiens.backend.assets.dto.AssetUpsertRequest;
import com.geosapiens.backend.assets.exceptions.AssetNotFoundException;
import com.geosapiens.backend.assets.exceptions.GlobalExceptionHandler;
import com.geosapiens.backend.assets.exceptions.SerialNumberConflictException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class AssetControllerErrorHandlingTest {

  private AssetService assetService;
  private MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    assetService = mock(AssetService.class);
    mockMvc = MockMvcBuilders
        .standaloneSetup(new AssetController(assetService))
        .setControllerAdvice(new GlobalExceptionHandler())
        .build();
  }

  @Test
  void shouldReturn404WhenDeletingMissingAsset() throws Exception {
    doThrow(new AssetNotFoundException(999L)).when(assetService).delete(999L);

    mockMvc.perform(delete("/assets/{id}", 999L))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.status").value(404))
        .andExpect(jsonPath("$.code").value("ASSET_NOT_FOUND"))
        .andExpect(jsonPath("$.path").value("/assets/999"));
  }

  @Test
  void shouldReturn404WhenUpdatingMissingAsset() throws Exception {
    when(assetService.update(eq(999L), any(AssetUpsertRequest.class)))
        .thenThrow(new AssetNotFoundException(999L));

    mockMvc.perform(put("/assets/{id}", 999L)
        .contentType(MediaType.APPLICATION_JSON)
        .content(validAssetPayload("SN-404")))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.status").value(404))
        .andExpect(jsonPath("$.code").value("ASSET_NOT_FOUND"))
        .andExpect(jsonPath("$.path").value("/assets/999"));
  }

  @Test
  void shouldReturn409WhenCreatingAssetWithDuplicateSerialNumber() throws Exception {
    when(assetService.create(any(AssetUpsertRequest.class)))
        .thenThrow(new SerialNumberConflictException("SN-CONFLICT-001"));

    mockMvc.perform(post("/assets")
        .contentType(MediaType.APPLICATION_JSON)
        .content(validAssetPayload("SN-CONFLICT-001")))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.status").value(409))
        .andExpect(jsonPath("$.code").value("SERIAL_NUMBER_CONFLICT"))
        .andExpect(jsonPath("$.path").value("/assets"));
  }

  private static String validAssetPayload(String serialNumber) {
    return """
        {
          "name": "Notebook de Teste",
          "serialNumber": "%s",
          "category": "COMPUTER",
          "status": "IN_USE",
          "acquisitionDate": "2024-01-10"
        }
        """.formatted(serialNumber);
  }
}
