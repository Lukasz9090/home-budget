package com.homebudget.account;

import java.util.UUID;

public record AccountResponse(UUID id, String email) {

    static AccountResponse of(AccountPrincipal principal) {
        return new AccountResponse(principal.id(), principal.email());
    }
}
