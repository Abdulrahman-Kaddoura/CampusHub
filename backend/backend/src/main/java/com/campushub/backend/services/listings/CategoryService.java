package com.campushub.backend.services.listings;

import com.campushub.backend.exceptions.category.CategoryNotFoundException;
import com.campushub.backend.models.listings.Category;
import com.campushub.backend.repositories.listing.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CategoryService {
    @Autowired
    CategoryRepository categoryRepository;

    public Category createCategory(Category category, UUID parentId) {
        if (parentId != null) {
            Category parent = categoryRepository.findById(parentId)
                    .orElseThrow(() -> new CategoryNotFoundException("Parent category not found with id: " + parentId));
            category.setParent(parent);
        }
        return categoryRepository.save(category);
    }

    public Category findCategoryByName(String name) {
        return categoryRepository.findByName(name)
                .orElseThrow(() -> new CategoryNotFoundException("Category not found: " + name));
    }

    public Category deleteCategoryById(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryNotFoundException("Category not found with id: " + id));
        categoryRepository.delete(category);
        return category;
    }

    public Category deleteCategoryByName(String name) {
        Category category = categoryRepository.findByName(name)
                .orElseThrow(() -> new CategoryNotFoundException("Category not found with name: " + name));
        categoryRepository.delete(category);
        return category;
    }

    public List<Category> findAllCategories() {
        return categoryRepository.findAll();
    }

}
