package com.campushub.backend.dtos.tutoring;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
public class TutoringRequestDTO {

    @NotBlank(message = "Course is required")
    @Size(max = 120, message = "Course must not exceed 120 characters")
    private String course;

    @NotBlank(message = "Tutor name is required")
    @Size(max = 120, message = "Tutor name must not exceed 120 characters")
    private String tutorName;

    @NotBlank(message = "Department is required")
    @Size(max = 80, message = "Department must not exceed 80 characters")
    private String department;

    @NotBlank(message = "Format is required")
    @Size(max = 50, message = "Format must not exceed 50 characters")
    private String format;

    @NotNull(message = "Hourly rate is required")
    @DecimalMax(value = "9999999.99", message = "Hourly rate is too high")
    @Digits(integer = 10, fraction = 2, message = "Hourly rate must have at most 2 decimal places")
    private BigDecimal hourlyRate;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotNull(message = "User Id is required")
    private UUID userId;
}