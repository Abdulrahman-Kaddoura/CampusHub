package com.campushub.backend.dtos.admin;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class AdminUpdateDormDTO {
    private String title;
    private String description;
    private String location;
    private String roomType;
    private BigDecimal monthlyRent;
    private LocalDate availableFrom;
}
