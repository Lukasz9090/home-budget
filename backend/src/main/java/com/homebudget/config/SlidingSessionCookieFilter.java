package com.homebudget.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import org.springframework.core.annotation.Order;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.session.web.http.CookieSerializer.CookieValue;
import org.springframework.session.web.http.SessionRepositoryFilter;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Re-sends the session cookie on every request that carries a valid session, so the browser cookie
 * ({@code max-age: 45d}) expires 45 days after the <em>last</em> visit, matching the server-side
 * sliding expiry. Spring Session itself only writes the cookie when the session id is new or
 * changed. Runs right after {@link SessionRepositoryFilter} and before Spring Security; never
 * creates a session.
 */
@Component
@Order(SessionRepositoryFilter.DEFAULT_ORDER + 1)
public class SlidingSessionCookieFilter extends OncePerRequestFilter {

    private final CookieSerializer cookieSerializer;

    public SlidingSessionCookieFilter(CookieSerializer cookieSerializer) {
        this.cookieSerializer = cookieSerializer;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        if (request.isRequestedSessionIdValid()) {
            HttpSession session = request.getSession(false);
            if (session != null) {
                cookieSerializer.writeCookieValue(new CookieValue(request, response, session.getId()));
            }
        }
        chain.doFilter(request, response);
    }
}
