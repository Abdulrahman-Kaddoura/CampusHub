package com.campushub.backend.dtos.dorm;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class DormRequestDTO {

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 100, message = "Title must be between 5 and 100 characters")
    private String title;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotBlank(message = "Location is required")
    @Size(max = 150, message = "Location must not exceed 150 characters")
    private String location;

    @NotBlank(message = "Room type is required")
    @Size(max = 50, message = "Room type must not exceed 50 characters")
    private String roomType;

    @NotNull(message = "Monthly rent is required")
    @DecimalMax(value = "9999999.99", message = "Monthly rent is too high")
    @Digits(integer = 10, fraction = 2, message = "Monthly rent must have at most 2 decimal places")
    private BigDecimal monthlyRent;

    @NotNull(message = "Availability date is required")
    private LocalDate availableFrom;

    @NotNull(message = "User Id is required")
    private UUID userId;
}