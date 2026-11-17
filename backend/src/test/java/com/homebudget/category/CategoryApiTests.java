package com.homebudget.category;

import static com.homebudget.support.TestAccounts.as;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
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

/** {@code GET}/{@code POST /api/categories} contract: shapes, validation, uniqueness, auth and CSRF. */
@SpringBootTest
@Import(TestcontainersConfiguration.class)
@AutoConfigureMockMvc
class CategoryApiTests {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    TestAccounts accounts;

    @Test
    void createReturnsTrimmedNameAndKindAndListContainsIt() throws Exception {
        AccountPrincipal owner = accounts.create();

        String created = create(owner, "  Wakacje  ", "CUMULATIVE")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.name").value("Wakacje"))
                .andExpect(jsonPath("$.kind").value("CUMULATIVE"))
                .andReturn()
                .getResponse()
                .getContentAsString();
        String id = JsonPath.read(created, "$.id");

        mockMvc.perform(get("/api/categories").with(as(owner)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(id))
                .andExpect(jsonPath("$[0].name").value("Wakacje"))
                .andExpect(jsonPath("$[0].kind").value("CUMULATIVE"));
    }

    @Test
    void listForFreshAccountIsEmpty() throws Exception {
        mockMvc.perform(get("/api/categories").with(as(accounts.create())))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    @Test
    void duplicateNameInOtherLetterCaseIsConflict() throws Exception {
        AccountPrincipal owner = accounts.create();
        create(owner, "Wakacje", "CUMULATIVE").andExpect(status().isCreated());

        create(owner, " wakacje ", "FLOW")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Masz już kategorię o tej nazwie."));

        mockMvc.perform(get("/api/categories").with(as(owner)))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[*].name", hasItem("Wakacje")));
    }

    @Test
    void blankNameIsBadRequest() throws Exception {
        create(accounts.create(), "   ", "FLOW")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").value("Podaj nazwę kategorii."));
    }

    @Test
    void nameLongerThan40CharactersAfterTrimmingIsBadRequest() throws Exception {
        create(accounts.create(), " " + "x".repeat(41) + " ", "FLOW")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").value("Nazwa może mieć najwyżej 40 znaków."));
    }

    @Test
    void nameOf40CharactersPaddedWithSpacesIsCreated() throws Exception {
        String name = "x".repeat(40);

        create(accounts.create(), "   " + name + "   ", "FLOW")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value(name));
    }

    @Test
    void missingKindIsBadRequest() throws Exception {
        mockMvc.perform(post("/api/categories")
                        .with(as(accounts.create()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Jedzenie\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.kind").isNotEmpty());
    }

    /** Jackson rejects the enum value before Bean Validation runs, so there is no {@code errors} map. */
    @Test
    void unknownKindIsBadRequest() throws Exception {
        create(accounts.create(), "Jedzenie", "MONTHLY").andExpect(status().isBadRequest());
    }

    @Test
    void unauthenticatedListIsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/categories")).andExpect(status().isUnauthorized());
    }

    @Test
    void createWithoutCsrfHeaderIsForbidden() throws Exception {
        AccountPrincipal owner = accounts.create();

        mockMvc.perform(post("/api/categories")
                        .with(user(owner))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("Jedzenie", "FLOW")))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/categories").with(as(owner)))
                .andExpect(content().json("[]"));
    }

    private ResultActions create(AccountPrincipal owner, String name, String kind) throws Exception {
        return mockMvc.perform(post("/api/categories")
                .with(as(owner))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body(name, kind)));
    }

    static String body(String name, String kind) {
        return "{\"name\":\"" + name + "\",\"kind\":\"" + kind + "\"}";
    }
}
