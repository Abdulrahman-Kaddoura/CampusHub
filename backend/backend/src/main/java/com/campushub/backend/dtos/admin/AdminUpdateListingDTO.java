package com.campushub.backend.dtos.admin;

import com.campushub.backend.enums.listings.ListingStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class AdminUpdateListingDTO {
    private String title;
    private String description;
    private BigDecimal price;
    private ListingStatus status;
}
