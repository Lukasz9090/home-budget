package com.homebudget.category;

/** The account already has a category with this name (case-insensitive). */
public class CategoryNameTakenException extends RuntimeException {

    public CategoryNameTakenException() {
        super("Masz już kategorię o tej nazwie.");
    }
}
