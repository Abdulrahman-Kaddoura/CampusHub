package com.campushub.backend.controllers.listing;

import com.campushub.backend.dtos.category.CategoryRequestDTO;
import com.campushub.backend.dtos.category.CategoryResponseDTO;
import com.campushub.backend.models.listings.Category;
import com.campushub.backend.services.listings.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.togglz.core.manager.FeatureManager;

import java.util.List;
import java.util.UUID;

import static com.campushub.backend.configurations.togglz.Features.*;


@RestController
@RequestMapping("/category")
@Tag(name = "Category", description = "Category related operations")
public class CategoryController {
    @Autowired
    CategoryService categoryService;

    @Autowired
    ModelMapper modelMapper;

    @Autowired
    FeatureManager featureManager;

    @PostMapping("/create-category")
    @Operation(summary = "Create Category",
            description = "Creates a new category in the system. Returns the created category's details.")
    public ResponseEntity<CategoryResponseDTO> createCategory(@RequestBody CategoryRequestDTO categoryRequestDTO) {
        if (!featureManager.isActive(CREATE_CATEGORY)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        Category category = new Category();
        category.setName(categoryRequestDTO.getCategoryName());
        Category createdCategory = categoryService.createCategory(category, categoryRequestDTO.getParentId());
        CategoryResponseDTO responseDTO = new CategoryResponseDTO();
        responseDTO.setCategoryId(createdCategory.getCategoryId());
        responseDTO.setCategoryName(createdCategory.getName());

        if (createdCategory.getParent() != null) {
            responseDTO.setParentId(createdCategory.getParent().getCategoryId());
            responseDTO.setParentName(createdCategory.getParent().getName());
        }
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    @DeleteMapping("/delete-category-by-id/{categoryId}")
    @Operation(summary = "Delete Category by ID",
            description = "Deletes an existing category using its UUID. Returns the deleted category's details.")
    public ResponseEntity<CategoryResponseDTO> deleteCategory(@PathVariable UUID categoryId) {
        if (!featureManager.isActive(DELETE_CATEGORY_BY_ID)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        Category deletedCategory = categoryService.deleteCategoryById(categoryId);

        CategoryResponseDTO categoryResponseDTO = modelMapper.map(deletedCategory, CategoryResponseDTO.class);

        return new ResponseEntity<>(categoryResponseDTO, HttpStatus.OK);
    }

    @DeleteMapping("/delete-category-by-name/{categoryName}")
    @Operation(summary = "Delete Category by Name",
            description = "Deletes an existing category using its name. Returns the deleted category's details.")
    public ResponseEntity<CategoryResponseDTO> deleteCategory(@PathVariable String categoryName) {
        if (!featureManager.isActive(DELETE_CATEGORY_BY_NAME)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        Category deletedCategory = categoryService.deleteCategoryByName(categoryName);

        CategoryResponseDTO categoryResponseDTO = modelMapper.map(deletedCategory, CategoryResponseDTO.class);

        return new ResponseEntity<>(categoryResponseDTO, HttpStatus.OK);
    }

    @GetMapping("/get-all-categories")
    @Operation(summary = "Get All Categories",
            description = "Retrieves all categories available in the system and returns them all in a list.")
    public ResponseEntity<List<CategoryResponseDTO>> getAllCategories() {
        if (!featureManager.isActive(GET_ALL_CATEGORIES)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        List<Category> categories = categoryService.findAllCategories();
        List<CategoryResponseDTO> categoryDTOs = categories.stream()
                .map(category -> modelMapper.map(category, CategoryResponseDTO.class))
                .toList();
        return new ResponseEntity<>(categoryDTOs, HttpStatus.OK);
    }

}
