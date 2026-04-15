package com.campushub.backend.dtos.admin;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class AdminUpdateTutoringDTO {
    private String course;
    private String tutorName;
    private String department;
    private String format;
    private BigDecimal hourlyRate;
    private String description;
}
