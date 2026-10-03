package com.homebudget.account;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * JSON sign-up, login and current-account endpoints. Logout is Spring Security's logout filter on
 * {@code POST /api/auth/logout} (see {@code SecurityConfig}).
 */
@RestController
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final AccountService accountService;
    private final SessionAuthenticationStrategy sessionAuthenticationStrategy;
    private final SecurityContextRepository securityContextRepository;
    private final CurrentUser currentUser;
    private final SecurityContextHolderStrategy securityContextHolderStrategy =
            SecurityContextHolder.getContextHolderStrategy();

    public AuthController(
            AuthenticationManager authenticationManager,
            AccountService accountService,
            SessionAuthenticationStrategy sessionAuthenticationStrategy,
            SecurityContextRepository securityContextRepository,
            CurrentUser currentUser) {
        this.authenticationManager = authenticationManager;
        this.accountService = accountService;
        this.sessionAuthenticationStrategy = sessionAuthenticationStrategy;
        this.securityContextRepository = securityContextRepository;
        this.currentUser = currentUser;
    }

    /** Creates the account and logs the caller in straight away. */
    @PostMapping("/api/auth/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AccountResponse register(
            @Valid @RequestBody RegisterRequest body, HttpServletRequest request, HttpServletResponse response) {
        AccountPrincipal principal = accountService.register(body.email(), body.password());
        Authentication authentication =
                UsernamePasswordAuthenticationToken.authenticated(principal, null, principal.getAuthorities());
        establishSession(authentication, request, response);
        return AccountResponse.of(principal);
    }

    /**
     * Wrong e-mail and wrong password both surface as {@code BadCredentialsException} (mapped to one
     * generic 401).
     */
    @PostMapping("/api/auth/login")
    public AccountResponse login(
            @Valid @RequestBody LoginRequest body, HttpServletRequest request, HttpServletResponse response) {
        Authentication authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(body.email(), body.password()));
        establishSession(authentication, request, response);
        return AccountResponse.of((AccountPrincipal) authentication.getPrincipal());
    }

    @GetMapping("/api/me")
    public AccountResponse me() {
        return AccountResponse.of(currentUser.principal());
    }

    /**
     * Order matters: change the session id (fixation) and rotate the CSRF token first, then save the
     * context — saving first would leave it in the old, possibly fixated session.
     */
    private void establishSession(
            Authentication authentication, HttpServletRequest request, HttpServletResponse response) {
        sessionAuthenticationStrategy.onAuthentication(authentication, request, response);
        SecurityContext context = securityContextHolderStrategy.createEmptyContext();
        context.setAuthentication(authentication);
        securityContextHolderStrategy.setContext(context);
        securityContextRepository.saveContext(context, request, response);
        // Materialise the rotated CSRF token so the new XSRF-TOKEN cookie is sent with this response.
        if (request.getAttribute(CsrfToken.class.getName()) instanceof CsrfToken csrfToken) {
            csrfToken.getToken();
        }
    }
}
