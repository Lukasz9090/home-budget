package com.homebudget.account;

import static com.homebudget.support.TestAccounts.as;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.homebudget.TestcontainersConfiguration;
import com.homebudget.support.TestAccounts;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Account isolation on the only owned resource so far (the account itself). Template for every
 * later slice: create two accounts with {@link TestAccounts}, act as one, and assert the other's
 * data never shows up (and that another account's resource answers 404).
 */
@SpringBootTest
@Import(TestcontainersConfiguration.class)
@AutoConfigureMockMvc
class AccountIsolationTests {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    TestAccounts accounts;

    @Autowired
    CurrentUser currentUser;

    @Test
    void meReturnsOnlyTheCallersAccount() throws Exception {
        AccountPrincipal a = accounts.create("a");
        AccountPrincipal b = accounts.create("b");

        String asA = mockMvc.perform(get("/api/me").with(as(a)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(a.id().toString()))
                .andExpect(jsonPath("$.email").value(a.email()))
                .andReturn()
                .getResponse()
                .getContentAsString();
        String asB = mockMvc.perform(get("/api/me").with(as(b)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(b.id().toString()))
                .andExpect(jsonPath("$.email").value(b.email()))
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertThat(asA).doesNotContain(b.id().toString(), b.email());
        assertThat(asB).doesNotContain(a.id().toString(), a.email());
    }

    /** The helper also carries a CSRF token, so mutating requests work as the account. */
    @Test
    void helperAuthorisesMutatingRequests() throws Exception {
        mockMvc.perform(post("/api/auth/logout").with(as(accounts.create()))).andExpect(status().isNoContent());
    }

    @Test
    void currentUserWithoutAuthenticationThrows() {
        SecurityContextHolder.clearContext();

        assertThatThrownBy(currentUser::id).isInstanceOf(AuthenticationCredentialsNotFoundException.class);
    }

    /**
     * {@code /api/me} is authenticated by URL rules, so a request authenticated as something other
     * than an account reaches the controller with no {@link AccountPrincipal}: {@code CurrentUser}
     * throwing inside a controller must surface as 401, not 500.
     */
    @Test
    void currentUserWithoutAccountInsideControllerIs401() throws Exception {
        mockMvc.perform(get("/api/me").with(user("not-an-account"))).andExpect(status().isUnauthorized());
    }
}
