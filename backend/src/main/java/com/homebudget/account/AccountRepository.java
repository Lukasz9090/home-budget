package com.homebudget.account;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountRepository extends JpaRepository<Account, UUID> {

    /** @param email already normalised via {@link EmailAddress#normalize(String)} */
    Optional<Account> findByEmail(String email);

    /** @param email already normalised via {@link EmailAddress#normalize(String)} */
    boolean existsByEmail(String email);
}
