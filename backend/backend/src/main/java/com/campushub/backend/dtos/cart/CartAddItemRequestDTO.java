package com.campushub.backend.dtos.cart;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CartAddItemRequestDTO {

    @NotNull(message = "Listing ID is required")
    private UUID listingId;
}
