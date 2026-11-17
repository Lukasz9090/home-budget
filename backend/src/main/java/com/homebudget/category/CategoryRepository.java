package com.homebudget.category;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/** Owner-scoped access only: services and controllers never call the inherited unscoped methods. */
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    List<Category> findAllByOwnerId(UUID ownerId);

    boolean existsByOwnerIdAndNameIgnoreCase(UUID ownerId, String name);
}
