package com.homebudget.category;

import java.util.UUID;

public record CategoryResponse(UUID id, String name, CategoryKind kind) {

    static CategoryResponse of(Category category) {
        return new CategoryResponse(category.getId(), category.getName(), category.getKind());
    }
}
