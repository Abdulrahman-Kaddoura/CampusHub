package com.campushub.backend.dtos.courseExchange;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CourseExchangeResponseDTO {

    private UUID courseExchangeId;
    private String currentCourse;
    private String desiredCourse;
    private String section;
    private String status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UUID userId;
}