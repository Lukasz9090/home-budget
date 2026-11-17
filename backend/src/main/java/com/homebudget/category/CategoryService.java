package com.homebudget.category;

import java.util.List;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

/**
 * Owner-scoped category operations. Deliberately not {@code @Transactional}: {@code saveAndFlush}
 * must run the INSERT inside the {@code try} in {@link #create}, so a concurrent duplicate becomes a
 * 409 rather than a 500 at commit.
 */
@Service
public class CategoryService {

    private static final String NAME_UNIQUE_INDEX = "categories_owner_name_uk";

    private final CategoryRepository categories;

    public CategoryService(CategoryRepository categories) {
        this.categories = categories;
    }

    public List<Category> list(UUID ownerId) {
        return categories.findAllByOwnerId(ownerId);
    }

    /**
     * @param name already stripped (see {@link CreateCategoryRequest})
     * @throws CategoryNameTakenException when the owner already has a category with this name in any letter case
     */
    public Category create(UUID ownerId, String name, CategoryKind kind) {
        if (categories.existsByOwnerIdAndNameIgnoreCase(ownerId, name)) {
            throw new CategoryNameTakenException();
        }
        try {
            return categories.saveAndFlush(new Category(ownerId, name, kind));
        } catch (DataIntegrityViolationException e) {
            // Two concurrent creates with the same name: the unique index decides.
            if (String.valueOf(e.getMostSpecificCause().getMessage()).contains(NAME_UNIQUE_INDEX)) {
                throw new CategoryNameTakenException();
            }
            throw e;
        }
    }
}
