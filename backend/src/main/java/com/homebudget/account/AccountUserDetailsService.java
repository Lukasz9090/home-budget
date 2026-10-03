package com.homebudget.account;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AccountUserDetailsService implements UserDetailsService {

    private final AccountRepository accounts;

    public AccountUserDetailsService(AccountRepository accounts) {
        this.accounts = accounts;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return accounts.findByEmail(EmailAddress.normalize(username))
                .map(AccountPrincipal::of)
                .orElseThrow(() -> new UsernameNotFoundException("No account for the given e-mail"));
    }
}
