package com.campushub.backend.dtos.admin;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AdminUpdateCourseExchangeDTO {
    private String currentCourse;
    private String desiredCourse;
    private String section;
    private String status;
    private String notes;
}
