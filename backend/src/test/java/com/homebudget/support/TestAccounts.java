package com.homebudget.support;

import static com.homebudget.support.CookieJarClient.XSRF_TOKEN;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;

import com.homebudget.account.AccountPrincipal;
import com.homebudget.account.AccountService;
import jakarta.servlet.http.Cookie;
import java.util.Arrays;
import java.util.UUID;
import java.util.stream.Stream;
import org.springframework.stereotype.Component;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

/**
 * Persisted test accounts for cross-account (isolation) tests. Picked up by component scanning in
 * every {@code @SpringBootTest}; inject it with {@code @Autowired}.
 *
 * <pre>{@code
 * AccountPrincipal a = accounts.create();
 * AccountPrincipal b = accounts.create();
 * mockMvc.perform(get("/api/things/" + idOwnedByA).with(as(b))).andExpect(status().isNotFound());
 * }</pre>
 *
 * Requests made {@link #as(AccountPrincipal) as} an account skip the login endpoint (covered by
 * {@code AuthFlowTests}): the principal goes straight into the request's security context.
 */
@Component
public class TestAccounts {

    public static final String PASSWORD = "test-password";

    private final AccountService accountService;

    public TestAccounts(AccountService accountService) {
        this.accountService = accountService;
    }

    /** A new account with a unique e-mail. */
    public AccountPrincipal create() {
        return create("account");
    }

    /** A new account with a unique e-mail starting with {@code emailPrefix} (handy in failure output). */
    public AccountPrincipal create(String emailPrefix) {
        return accountService.register(emailPrefix + "-" + UUID.randomUUID() + "@test.pl", PASSWORD);
    }

    /**
     * Authenticates a MockMvc request as {@code principal} ({@code user(principal)}) and adds a valid
     * CSRF token for mutating calls.
     *
     * <p>The token is sent the way the browser does it ({@code XSRF-TOKEN} cookie echoed in
     * {@code X-XSRF-TOKEN}) instead of via Spring's {@code csrf()} post-processor: {@code csrf()}
     * permanently swaps the {@code CsrfFilter}'s repository for a session-based one in the cached
     * application context, which breaks the cookie-based CSRF tests that share that context.
     */
    public static RequestPostProcessor as(AccountPrincipal principal) {
        RequestPostProcessor user = user(principal);
        return request -> {
            String token = UUID.randomUUID().toString();
            Cookie[] existing = request.getCookies() == null ? new Cookie[0] : request.getCookies();
            request.setCookies(Stream.concat(
                            Arrays.stream(existing).filter(c -> !c.getName().equals(XSRF_TOKEN)),
                            Stream.of(new Cookie(XSRF_TOKEN, token)))
                    .toArray(Cookie[]::new));
            request.addHeader("X-XSRF-TOKEN", token);
            return user.postProcessRequest(request);
        };
    }
}
