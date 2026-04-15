package com.campushub.backend.dtos.admin;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminDormDTO {
    private UUID dormId;
    private String title;
    private String description;
    private String location;
    private String roomType;
    private BigDecimal monthlyRent;
    private LocalDate availableFrom;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UUID userId;
    private String userName;
}
