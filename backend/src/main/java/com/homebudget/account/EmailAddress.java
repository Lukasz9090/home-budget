package com.homebudget.account;

import java.util.Locale;

/** The single e-mail normalisation rule used by register, login and lookups. */
public final class EmailAddress {

    private EmailAddress() {}

    public static String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
