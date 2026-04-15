package com.campushub.backend.dtos.admin;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminTutoringDTO {
    private UUID tutoringId;
    private String course;
    private String tutorName;
    private String department;
    private String format;
    private BigDecimal hourlyRate;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UUID userId;
    private String userName;
}
