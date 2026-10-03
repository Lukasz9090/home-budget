package com.homebudget.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Reads the deferred CSRF token on every request so {@code XSRF-TOKEN} is written on the very first
 * response (even a 401 from {@code /api/me}) and the first login/register POST can pass CSRF.
 * Registered inside the security chain after {@code CsrfFilter}; deliberately not a bean, so Boot
 * does not also register it as a servlet filter.
 */
final class CsrfCookieFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        if (request.getAttribute(CsrfToken.class.getName()) instanceof CsrfToken csrfToken) {
            csrfToken.getToken();
        }
        chain.doFilter(request, response);
    }
}
