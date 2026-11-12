package com.homebudget.account;

import static com.homebudget.support.CookieJarClient.SESSION;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.homebudget.TestcontainersConfiguration;
import com.homebudget.support.CookieJarClient;
import jakarta.servlet.http.Cookie;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

/** End-to-end auth contract with real SESSION and XSRF-TOKEN cookies, against Postgres. */
@SpringBootTest
@Import(TestcontainersConfiguration.class)
@AutoConfigureMockMvc
class AuthFlowTests {

    static final String PASSWORD = "correct-horse";

    @Autowired
    MockMvc mockMvc;

    @Autowired
    AccountRepository accounts;

    CookieJarClient browser;

    @BeforeEach
    void bootstrapCsrf() throws Exception {
        browser = new CookieJarClient(mockMvc);
        // First visit: the SPA asks who is logged in; the 401 response carries XSRF-TOKEN.
        browser.get("/api/me").andExpect(status().isUnauthorized());
    }

    @Test
    void registerLogsInAndMeReturnsTheAccount() throws Exception {
        String email = uniqueEmail();

        browser.postJson("/api/auth/register", credentials(email, PASSWORD))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.email").value(email));
        assertThat(browser.cookieValue(SESSION)).isNotBlank();

        browser.get("/api/me")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email));
    }

    @Test
    void registerStoresNormalisedEmailAndBcryptHash() throws Exception {
        String email = uniqueEmail();

        browser.postJson("/api/auth/register", credentials(email.toUpperCase(), PASSWORD))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value(email));

        Account stored = accounts.findByEmail(email).orElseThrow();
        assertThat(stored.getPasswordHash()).startsWith("{bcrypt}");
    }

    @Test
    void registerWithExistingEmailInOtherCaseIsConflict() throws Exception {
        String email = uniqueEmail();
        browser.postJson("/api/auth/register", credentials(email, PASSWORD)).andExpect(status().isCreated());

        CookieJarClient other = new CookieJarClient(mockMvc);
        other.get("/api/me");
        other.postJson("/api/auth/register", credentials(email.toUpperCase(), PASSWORD))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Konto z tym adresem e-mail już istnieje."));
    }

    @Test
    void registerValidatesPasswordLengthAndEmail() throws Exception {
        browser.postJson("/api/auth/register", credentials(uniqueEmail(), "x".repeat(7)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.password").isNotEmpty());
        browser.postJson("/api/auth/register", credentials(uniqueEmail(), "x".repeat(73)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.password").isNotEmpty());
        browser.postJson("/api/auth/register", credentials("not-an-email", PASSWORD))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.email").isNotEmpty());

        browser.postJson("/api/auth/register", credentials(uniqueEmail(), "x".repeat(8)))
                .andExpect(status().isCreated());
        browser.postJson("/api/auth/register", credentials(uniqueEmail(), "x".repeat(72)))
                .andExpect(status().isCreated());
    }

    @Test
    void loginIssuesNewSessionIdAndInvalidatesThePreviousOne() throws Exception {
        String email = uniqueEmail();
        browser.postJson("/api/auth/register", credentials(email, PASSWORD)).andExpect(status().isCreated());
        String sessionBeforeLogin = browser.cookieValue(SESSION);

        browser.postJson("/api/auth/login", credentials(email.toUpperCase(), PASSWORD))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.id").isNotEmpty());
        String sessionAfterLogin = browser.cookieValue(SESSION);

        assertThat(sessionAfterLogin).isNotBlank().isNotEqualTo(sessionBeforeLogin);
        browser.get("/api/me")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email));

        CookieJarClient attacker = new CookieJarClient(mockMvc);
        attacker.setCookie(new Cookie(SESSION, sessionBeforeLogin));
        attacker.get("/api/me").andExpect(status().isUnauthorized());
    }

    @Test
    void wrongPasswordAndUnknownEmailGiveIdenticalResponses() throws Exception {
        String email = uniqueEmail();
        browser.postJson("/api/auth/register", credentials(email, PASSWORD)).andExpect(status().isCreated());

        CookieJarClient guest = new CookieJarClient(mockMvc);
        guest.get("/api/me");
        String wrongPassword = guest.postJson("/api/auth/login", credentials(email, "wrong-password"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("Nieprawidłowy e-mail lub hasło."))
                .andReturn()
                .getResponse()
                .getContentAsString();
        String unknownEmail = guest.postJson("/api/auth/login", credentials(uniqueEmail(), PASSWORD))
                .andExpect(status().isUnauthorized())
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertThat(unknownEmail).isEqualTo(wrongPassword);
        assertThat(guest.cookieValue(SESSION)).isNull();
    }

    @Test
    void logoutEndsTheSession() throws Exception {
        browser.postJson("/api/auth/register", credentials(uniqueEmail(), PASSWORD))
                .andExpect(status().isCreated());
        String session = browser.cookieValue(SESSION);

        browser.postJson("/api/auth/logout", "").andExpect(status().isNoContent());
        assertThat(browser.cookieValue(SESSION)).isNull();

        CookieJarClient oldCookie = new CookieJarClient(mockMvc);
        oldCookie.setCookie(new Cookie(SESSION, session));
        oldCookie.get("/api/me").andExpect(status().isUnauthorized());
        browser.get("/api/me").andExpect(status().isUnauthorized());
    }

    static String uniqueEmail() {
        return "jan-" + UUID.randomUUID() + "@x.pl";
    }

    static String credentials(String email, String password) {
        return "{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}";
    }
}
