package com.campushub.backend.dtos.courseExchange;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CourseExchangeRequestDTO {

    @NotBlank(message = "Current course is required")
    @Size(max = 120, message = "Current course must not exceed 120 characters")
    private String currentCourse;

    @NotBlank(message = "Desired course is required")
    @Size(max = 120, message = "Desired course must not exceed 120 characters")
    private String desiredCourse;

    @Size(max = 50, message = "Section must not exceed 50 characters")
    private String section;

    @NotBlank(message = "Status is required")
    @Size(max = 40, message = "Status must not exceed 40 characters")
    private String status;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;

    @NotNull(message = "User Id is required")
    private UUID userId;
}