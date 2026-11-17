package com.homebudget.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** {@code name} is stripped before validation, so the 40-character limit applies to the stored value. */
public record CreateCategoryRequest(
        @NotBlank(message = "Podaj nazwę kategorii.") @Size(max = 40, message = "Nazwa może mieć najwyżej 40 znaków.")
        String name,

        @NotNull CategoryKind kind) {

    public CreateCategoryRequest {
        name = name == null ? null : name.strip();
    }
}
