package com.homebudget.account;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AccountService {

    private static final String EMAIL_UNIQUE_INDEX = "users_email_uk";

    private final AccountRepository accounts;
    private final PasswordEncoder passwordEncoder;

    public AccountService(AccountRepository accounts, PasswordEncoder passwordEncoder) {
        this.accounts = accounts;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Creates an account with a hashed password.
     *
     * @throws EmailAlreadyTakenException when the (normalised) e-mail already has an account
     */
    public AccountPrincipal register(String email, String rawPassword) {
        String normalized = EmailAddress.normalize(email);
        if (accounts.existsByEmail(normalized)) {
            throw new EmailAlreadyTakenException();
        }
        Account account;
        try {
            account = accounts.saveAndFlush(new Account(normalized, passwordEncoder.encode(rawPassword)));
        } catch (DataIntegrityViolationException e) {
            // Two concurrent sign-ups with the same e-mail: the unique index decides.
            if (String.valueOf(e.getMostSpecificCause().getMessage()).contains(EMAIL_UNIQUE_INDEX)) {
                throw new EmailAlreadyTakenException();
            }
            throw e;
        }
        AccountPrincipal principal = AccountPrincipal.of(account);
        principal.eraseCredentials();
        return principal;
    }
}
