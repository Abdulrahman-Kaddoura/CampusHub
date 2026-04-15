package com.campushub.backend.dtos.admin;

import com.campushub.backend.enums.listings.ListingStatus;
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
public class AdminListingDTO {
    private UUID listingId;
    private String title;
    private String description;
    private BigDecimal price;
    private ListingStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UUID userId;
    private String userName;
    private String categoryName;
}
