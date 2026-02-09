package com.campushub.backend.dtos.category;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CategoryResponseDTO {

    private UUID categoryId;
    private String categoryName;

    // Optional parent category info
    private UUID parentId;
    private String parentName;
}
