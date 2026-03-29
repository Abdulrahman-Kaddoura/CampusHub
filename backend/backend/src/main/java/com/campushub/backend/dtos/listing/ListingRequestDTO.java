package com.campushub.backend.dtos.listing;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
public class ListingRequestDTO {

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 100, message = "Title must be between 5 and 100 characters")
    private String title;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMax(value = "9999999.99", message = "Price is too high")
    @Digits(integer = 10, fraction = 2, message = "Price must have at most 2 decimal places")
    private BigDecimal price;

    private UUID userId;

    @NotBlank(message = "Category name cannot be blank")
    private String categoryName;

}
