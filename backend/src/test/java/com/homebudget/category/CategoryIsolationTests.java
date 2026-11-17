package com.homebudget.category;

import static com.homebudget.support.TestAccounts.as;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.homebudget.TestcontainersConfiguration;
import com.homebudget.account.AccountPrincipal;
import com.homebudget.support.TestAccounts;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

/** Categories are owner-scoped: another account never sees them and keeps its own name space. */
@SpringBootTest
@Import(TestcontainersConfiguration.class)
@AutoConfigureMockMvc
class CategoryIsolationTests {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    TestAccounts accounts;

    @Test
    void otherAccountDoesNotSeeCategories() throws Exception {
        AccountPrincipal a = accounts.create("a");
        AccountPrincipal b = accounts.create("b");
        String flowId = idOf(create(a, "Jedzenie", "FLOW").andExpect(status().isCreated()));
        String cumulativeId = idOf(create(a, "Oszczędności", "CUMULATIVE").andExpect(status().isCreated()));

        String asB = mockMvc.perform(get("/api/categories").with(as(b)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0))
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertThat(asB).doesNotContain(flowId, cumulativeId, "Jedzenie", "Oszczędności");
        mockMvc.perform(get("/api/categories").with(as(a)))
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void accountsCanUseTheSameName() throws Exception {
        AccountPrincipal a = accounts.create("a");
        AccountPrincipal b = accounts.create("b");

        create(a, "Wakacje", "CUMULATIVE").andExpect(status().isCreated());
        create(b, "Wakacje", "CUMULATIVE").andExpect(status().isCreated());

        mockMvc.perform(get("/api/categories").with(as(a)))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Wakacje"));
        mockMvc.perform(get("/api/categories").with(as(b)))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Wakacje"));
    }

    private ResultActions create(AccountPrincipal owner, String name, String kind) throws Exception {
        return mockMvc.perform(post("/api/categories")
                .with(as(owner))
                .contentType(MediaType.APPLICATION_JSON)
                .content(CategoryApiTests.body(name, kind)));
    }

    private static String idOf(ResultActions created) throws Exception {
        return JsonPath.read(created.andReturn().getResponse().getContentAsString(), "$.id");
    }
}
