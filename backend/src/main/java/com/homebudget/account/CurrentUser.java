package com.homebudget.account;

import java.util.UUID;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.stereotype.Component;

/**
 * The single place that turns the security context into the current account. Controllers take the
 * owner id for every read and write from {@link #id()} — never from the request body or path — and
 * domain code never touches Spring Security directly.
 */
@Component
public class CurrentUser {

    private final SecurityContextHolderStrategy securityContextHolderStrategy =
            SecurityContextHolder.getContextHolderStrategy();

    /**
     * @return the id of the logged-in account, i.e. the {@code owner_id} to scope queries by
     * @throws AuthenticationCredentialsNotFoundException (answered with 401) when no account is logged in
     */
    public UUID id() {
        return principal().id();
    }

    /** @throws AuthenticationCredentialsNotFoundException (answered with 401) when no account is logged in */
    public AccountPrincipal principal() {
        Authentication authentication =
                securityContextHolderStrategy.getContext().getAuthentication();
        if (authentication != null
                && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof AccountPrincipal principal) {
            return principal;
        }
        throw new AuthenticationCredentialsNotFoundException("No logged-in account");
    }
}
