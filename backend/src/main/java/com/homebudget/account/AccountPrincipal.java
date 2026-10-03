package com.homebudget.account;

import java.io.Serial;
import java.io.Serializable;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.CredentialsContainer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * The authenticated account stored in the session's {@code SecurityContext}. It is JDK-serialised
 * into {@code SPRING_SESSION_ATTRIBUTES}, so renaming or moving this class invalidates existing
 * sessions (users are logged out once).
 */
public final class AccountPrincipal implements UserDetails, CredentialsContainer, Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private final UUID id;
    private final String email;
    private String passwordHash;

    public AccountPrincipal(UUID id, String email, String passwordHash) {
        this.id = id;
        this.email = email;
        this.passwordHash = passwordHash;
    }

    static AccountPrincipal of(Account account) {
        return new AccountPrincipal(account.getId(), account.getEmail(), account.getPasswordHash());
    }

    public UUID id() {
        return id;
    }

    public String email() {
        return email;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    /** Single flat role: no authorities. */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public void eraseCredentials() {
        passwordHash = null;
    }

    @Override
    public boolean equals(Object o) {
        return o instanceof AccountPrincipal other && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return id.hashCode();
    }

    @Override
    public String toString() {
        return "AccountPrincipal[id=" + id + ", email=" + email + "]";
    }
}
