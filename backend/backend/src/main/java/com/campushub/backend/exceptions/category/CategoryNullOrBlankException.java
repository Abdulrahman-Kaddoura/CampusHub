package com.campushub.backend.exceptions.category;

public class CategoryNullOrBlankException extends RuntimeException {
    public CategoryNullOrBlankException(String message) {
        super(message);
    }
}
