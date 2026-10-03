package com.homebudget.support;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import jakarta.servlet.http.Cookie;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

/**
 * Drives MockMvc like a browser: keeps the cookies from each response (SESSION, XSRF-TOKEN) and
 * replays them on the next request; mutating requests echo {@code XSRF-TOKEN} in {@code X-XSRF-TOKEN}
 * the way Angular's HttpClient does.
 */
public final class CookieJarClient {

    public static final String SESSION = "SESSION";
    public static final String XSRF_TOKEN = "XSRF-TOKEN";

    private final MockMvc mockMvc;
    private final Map<String, Cookie> cookies = new LinkedHashMap<>();

    public CookieJarClient(MockMvc mockMvc) {
        this.mockMvc = mockMvc;
    }

    public ResultActions get(String url) throws Exception {
        return perform(MockMvcRequestBuilders.get(url));
    }

    /** POST with the CSRF header taken from the {@code XSRF-TOKEN} cookie (if the jar has one). */
    public ResultActions postJson(String url, String json) throws Exception {
        MockHttpServletRequestBuilder request = jsonPost(url, json);
        Cookie xsrf = cookies.get(XSRF_TOKEN);
        if (xsrf != null) {
            request.header("X-XSRF-TOKEN", xsrf.getValue());
        }
        return perform(request);
    }

    /** POST that does not send the CSRF header (the cookie is still sent, as a browser would). */
    public ResultActions postJsonWithoutCsrfHeader(String url, String json) throws Exception {
        return perform(jsonPost(url, json));
    }

    public ResultActions perform(MockHttpServletRequestBuilder request) throws Exception {
        if (!cookies.isEmpty()) {
            request.cookie(cookies.values().toArray(Cookie[]::new));
        }
        ResultActions actions = mockMvc.perform(request);
        absorb(actions.andReturn().getResponse());
        return actions;
    }

    public String cookieValue(String name) {
        Cookie cookie = cookies.get(name);
        return cookie == null ? null : cookie.getValue();
    }

    public void setCookie(Cookie cookie) {
        cookies.put(cookie.getName(), cookie);
    }

    /** The last {@code Set-Cookie} for {@code name} in the response (the one a browser keeps), or null. */
    public static Cookie lastCookie(MockHttpServletResponse response, String name) {
        Cookie last = null;
        for (Cookie cookie : response.getCookies()) {
            if (cookie.getName().equals(name)) {
                last = cookie;
            }
        }
        return last;
    }

    private void absorb(MockHttpServletResponse response) {
        for (Cookie cookie : response.getCookies()) {
            if (cookie.getMaxAge() == 0
                    || cookie.getValue() == null
                    || cookie.getValue().isEmpty()) {
                cookies.remove(cookie.getName());
            } else {
                cookies.put(cookie.getName(), cookie);
            }
        }
    }

    private static MockHttpServletRequestBuilder jsonPost(String url, String json) {
        return post(url).contentType(MediaType.APPLICATION_JSON).content(json);
    }
}
