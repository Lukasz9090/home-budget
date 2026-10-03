package com.homebudget.account;

/** Registration attempted with an e-mail that already belongs to an account. */
public class EmailAlreadyTakenException extends RuntimeException {

    public EmailAlreadyTakenException() {
        super("Konto z tym adresem e-mail już istnieje.");
    }
}
