package com.campushub.backend.services.listings;

import com.campushub.backend.models.listings.Category;
import com.campushub.backend.repositories.listing.CategoryRepository;
import com.campushub.backend.exceptions.category.CategoryNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    @Test
    void findOrCreateCategoryByName_returnsExistingCategory() {
        Category existing = new Category();
        existing.setName("Books");
        when(categoryRepository.findByName("Books")).thenReturn(Optional.of(existing));

        Category result = categoryService.findOrCreateCategoryByName("Books");

        assertSame(existing, result);
    }

    @Test
    void findOrCreateCategoryByName_createsWhenMissing() {
        Category created = new Category();
        created.setName("Electronics");

        when(categoryRepository.findByName("Electronics")).thenReturn(Optional.empty());
        when(categoryRepository.save(org.mockito.ArgumentMatchers.any(Category.class))).thenReturn(created);

        Category result = categoryService.findOrCreateCategoryByName("Electronics");

        assertEquals("Electronics", result.getName());
        verify(categoryRepository).save(org.mockito.ArgumentMatchers.any(Category.class));
    }

    @Test
    void findOrCreateCategoryByName_throwsOnBlankName() {
        assertThrows(CategoryNotFoundException.class, () -> categoryService.findOrCreateCategoryByName("   "));
    }
}
