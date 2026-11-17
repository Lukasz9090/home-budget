package com.homebudget.category;

import com.homebudget.account.CurrentUser;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** The current account's categories. The owner always comes from {@link CurrentUser#id()}. */
@RestController
public class CategoryController {

    private final CategoryService categoryService;
    private final CurrentUser currentUser;

    public CategoryController(CategoryService categoryService, CurrentUser currentUser) {
        this.categoryService = categoryService;
        this.currentUser = currentUser;
    }

    /** Order is unspecified; the client sorts. */
    @GetMapping("/api/categories")
    public List<CategoryResponse> list() {
        return categoryService.list(currentUser.id()).stream()
                .map(CategoryResponse::of)
                .toList();
    }

    @PostMapping("/api/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponse create(@Valid @RequestBody CreateCategoryRequest body) {
        return CategoryResponse.of(categoryService.create(currentUser.id(), body.name(), body.kind()));
    }
}
