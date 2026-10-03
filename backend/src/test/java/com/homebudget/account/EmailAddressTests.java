package com.homebudget.account;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class EmailAddressTests {

    @Test
    void normalizeTrimsAndLowercases() {
        assertThat(EmailAddress.normalize(" Jan@X.pl ")).isEqualTo("jan@x.pl");
    }
}
