package com.campushub.backend.dtos.cartItem;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
public class CartItemResponseDTO {

    private UUID cartItemId;
    private UUID listingId;
    private String listingTitle;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal totalPrice; // unitPrice * quantity
    private UUID parentCartId;
}
