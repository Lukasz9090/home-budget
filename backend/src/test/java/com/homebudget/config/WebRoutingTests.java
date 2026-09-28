package com.homebudget.config;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class WebRoutingTests {

    @Autowired
    MockMvc mockMvc;

    @Test
    void clientSideRouteFallsBackToIndexHtml() throws Exception {
        mockMvc.perform(get("/month/2026-09"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("spa-test-index")));
    }

    @Test
    void existingStaticFileIsServedDirectly() throws Exception {
        mockMvc.perform(get("/index.html"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("spa-test-index")));
    }

    @Test
    void apiRequiresAuthenticationAndReturns401() throws Exception {
        mockMvc.perform(get("/api/months")).andExpect(status().isUnauthorized());
    }

    @Test
    void healthIsPublicAndDoesNotNeedDatabaseCheck() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }
}
