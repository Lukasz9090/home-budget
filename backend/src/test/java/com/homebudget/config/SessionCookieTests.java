package com.homebudget.config;

import static com.homebudget.support.CookieJarClient.SESSION;
import static com.homebudget.support.CookieJarClient.XSRF_TOKEN;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.homebudget.support.CookieJarClient;
import jakarta.servlet.http.Cookie;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.servlet.MockMvc;

/**
 * CSRF cookie bootstrap/rotation and the sliding 45-day session cookie.
 *
 * <p>Runs with a real embedded server so Boot builds the session {@code CookieSerializer} from
 * {@code server.servlet.session.cookie.*} exactly as in production; in the default mock environment
 * Boot treats the app as a war deployment and takes cookie settings from the (mock) servlet
 * container instead, which has no max-age. Requests still go through MockMvc.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class SessionCookieTests {

    static final int FORTY_FIVE_DAYS_IN_SECONDS = 45 * 24 * 60 * 60;

    @Autowired
    MockMvc mockMvc;

    @Test
    void firstResponseIssuesXsrfCookieEvenOn401() throws Exception {
        MockHttpServletResponse response = mockMvc.perform(
                        org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/me"))
                .andExpect(status().isUnauthorized())
                .andReturn()
                .getResponse();

        Cookie xsrf = CookieJarClient.lastCookie(response, XSRF_TOKEN);
        assertThat(xsrf).isNotNull();
        assertThat(xsrf.getValue()).isNotBlank();
        assertThat(xsrf.isHttpOnly()).isFalse();
    }

    @Test
    void postsWithoutCsrfHeaderAreForbidden() throws Exception {
        CookieJarClient browser = bootstrapped();

        browser.postJsonWithoutCsrfHeader("/api/auth/register", credentials(uniqueEmail()))
                .andExpect(status().isForbidden());
        browser.postJsonWithoutCsrfHeader("/api/auth/login", credentials(uniqueEmail()))
                .andExpect(status().isForbidden());
    }

    @Test
    void postsWithTokenFromXsrfCookiePass() throws Exception {
        CookieJarClient browser = bootstrapped();
        String email = uniqueEmail();

        browser.postJson("/api/auth/register", credentials(email)).andExpect(status().isCreated());

        CookieJarClient other = bootstrapped();
        other.postJson("/api/auth/login", credentials(email)).andExpect(status().isOk());
    }

    @Test
    void loginRotatesCsrfTokenAndTheNewTokenWorks() throws Exception {
        CookieJarClient browser = bootstrapped();
        String email = uniqueEmail();
        browser.postJson("/api/auth/register", credentials(email)).andExpect(status().isCreated());
        String tokenAfterRegister = browser.cookieValue(XSRF_TOKEN);

        browser.postJson("/api/auth/login", credentials(email)).andExpect(status().isOk());
        String tokenAfterLogin = browser.cookieValue(XSRF_TOKEN);

        assertThat(tokenAfterRegister).isNotBlank();
        assertThat(tokenAfterLogin).isNotBlank().isNotEqualTo(tokenAfterRegister);
        browser.postJson("/api/auth/logout", "").andExpect(status().isNoContent());
    }

    @Test
    void authenticatedRequestRefreshesSessionCookie() throws Exception {
        CookieJarClient browser = bootstrapped();
        browser.postJson("/api/auth/register", credentials(uniqueEmail())).andExpect(status().isCreated());
        String session = browser.cookieValue(SESSION);

        MockHttpServletResponse response =
                browser.get("/api/me").andExpect(status().isOk()).andReturn().getResponse();

        Cookie refreshed = CookieJarClient.lastCookie(response, SESSION);
        assertThat(refreshed).isNotNull();
        assertThat(refreshed.getValue()).isEqualTo(session);
        assertThat(refreshed.getMaxAge()).isEqualTo(FORTY_FIVE_DAYS_IN_SECONDS);
        assertThat(refreshed.isHttpOnly()).isTrue();
        assertThat(response.getHeaders("Set-Cookie"))
                .anySatisfy(header ->
                        assertThat(header).startsWith(SESSION + "=").contains("Max-Age=" + FORTY_FIVE_DAYS_IN_SECONDS));
    }

    @Test
    void anonymousRequestsGetNoSessionCookie() throws Exception {
        CookieJarClient browser = new CookieJarClient(mockMvc);

        MockHttpServletResponse api = browser.get("/api/me")
                .andExpect(status().isUnauthorized())
                .andReturn()
                .getResponse();
        MockHttpServletResponse spa = browser.get("/month/2026-09")
                .andExpect(status().isOk())
                .andReturn()
                .getResponse();

        assertThat(CookieJarClient.lastCookie(api, SESSION)).isNull();
        assertThat(CookieJarClient.lastCookie(spa, SESSION)).isNull();
    }

    @Test
    void unknownSessionCookieIsNotRefreshed() throws Exception {
        CookieJarClient browser = new CookieJarClient(mockMvc);
        browser.setCookie(new Cookie(SESSION, "bm90LWEtcmVhbC1zZXNzaW9u"));

        MockHttpServletResponse response = browser.get("/api/me")
                .andExpect(status().isUnauthorized())
                .andReturn()
                .getResponse();

        Cookie session = CookieJarClient.lastCookie(response, SESSION);
        assertThat(session == null || session.getMaxAge() == 0).isTrue();
    }

    private CookieJarClient bootstrapped() throws Exception {
        CookieJarClient browser = new CookieJarClient(mockMvc);
        browser.get("/api/me").andExpect(status().isUnauthorized());
        assertThat(browser.cookieValue(XSRF_TOKEN)).isNotBlank();
        return browser;
    }

    private static String uniqueEmail() {
        return "session-" + UUID.randomUUID() + "@x.pl";
    }

    private static String credentials(String email) {
        return "{\"email\":\"" + email + "\",\"password\":\"correct-horse\"}";
    }
}
