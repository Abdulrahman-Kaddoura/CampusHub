package com.campushub.backend.models.listings;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CategoryTest {

    @Test
    void defaults_initializeCollections() {
        Category category = new Category();

        assertNotNull(category.getListings());
        assertNotNull(category.getSubcategories());
        assertTrue(category.getListings().isEmpty());
        assertTrue(category.getSubcategories().isEmpty());
    }

    @Test
    void parent_canBeAssigned() {
        Category parent = new Category();
        Category child = new Category();

        child.setParent(parent);

        assertSame(parent, child.getParent());
    }
}
