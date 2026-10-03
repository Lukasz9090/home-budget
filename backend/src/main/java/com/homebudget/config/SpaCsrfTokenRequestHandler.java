package com.homebudget.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.function.Supplier;
import org.jspecify.annotations.Nullable;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.csrf.CsrfTokenRequestHandler;
import org.springframework.security.web.csrf.XorCsrfTokenRequestAttributeHandler;
import org.springframework.util.StringUtils;

/**
 * Same behaviour as the handler behind {@code csrf.spa()} (private in Spring Security): BREACH-safe
 * XOR-masked tokens for rendered values, and the raw cookie value accepted from the
 * {@code X-XSRF-TOKEN} header that Angular's HttpClient sends.
 */
final class SpaCsrfTokenRequestHandler implements CsrfTokenRequestHandler {

    private final CsrfTokenRequestAttributeHandler plain = new CsrfTokenRequestAttributeHandler();
    private final CsrfTokenRequestAttributeHandler xor = new XorCsrfTokenRequestAttributeHandler();

    SpaCsrfTokenRequestHandler() {
        this.xor.setCsrfRequestAttributeName(null);
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, Supplier<CsrfToken> csrfToken) {
        this.xor.handle(request, response, csrfToken);
    }

    @Override
    public @Nullable String resolveCsrfTokenValue(HttpServletRequest request, CsrfToken csrfToken) {
        String headerValue = request.getHeader(csrfToken.getHeaderName());
        return (StringUtils.hasText(headerValue) ? this.plain : this.xor).resolveCsrfTokenValue(request, csrfToken);
    }
}
