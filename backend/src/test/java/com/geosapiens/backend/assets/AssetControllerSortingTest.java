package com.geosapiens.backend.assets;

import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.geosapiens.backend.assets.exceptions.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class AssetControllerSortingTest {

  private AssetService assetService;
  private MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    assetService = mock(AssetService.class);
    mockMvc = MockMvcBuilders
        .standaloneSetup(new AssetController(assetService))
        .setControllerAdvice(new GlobalExceptionHandler())
        .build();

    when(assetService.search(any(), any(), any(), any(Pageable.class)))
        .thenAnswer(invocation -> {
          Pageable pageable = invocation.getArgument(3);
          return Page.empty(pageable);
        });
  }

  @Test
  void shouldAcceptSortByNameAscending() throws Exception {
    mockMvc.perform(get("/assets").param("sort", "name,asc"))
        .andExpect(status().isOk());

    ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
    verify(assetService).search(any(), any(), any(), pageableCaptor.capture());

    Sort.Order order = pageableCaptor.getValue().getSort().getOrderFor("name");
    assertNotNull(order);
    assertEquals(Sort.Direction.ASC, order.getDirection());
  }

  @Test
  void shouldAcceptSortByAcquisitionDateDescending() throws Exception {
    mockMvc.perform(get("/assets").param("sort", "acquisitionDate,desc"))
        .andExpect(status().isOk());

    ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
    verify(assetService).search(any(), any(), any(), pageableCaptor.capture());

    Sort.Order order = pageableCaptor.getValue().getSort().getOrderFor("acquisitionDate");
    assertNotNull(order);
    assertEquals(Sort.Direction.DESC, order.getDirection());
  }

  @Test
  void shouldReturn400ForInvalidSortDirection() throws Exception {
    mockMvc.perform(get("/assets").param("sort", "name,wrong"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
        .andExpect(jsonPath("$.message").value(containsString("sort")));

    verifyNoInteractions(assetService);
  }
}
