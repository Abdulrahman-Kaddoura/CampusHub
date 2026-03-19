package com.campushub.backend.models.cart;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CartTest {

    @Test
    void defaults_areInitialized() {
        Cart cart = new Cart();

        assertEquals(BigDecimal.ZERO, cart.getTotalPrice());
        assertEquals(0, cart.getListingsQuantity());
        assertNotNull(cart.getCartItems());
        assertTrue(cart.getCartItems().isEmpty());
    }
}
