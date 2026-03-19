package com.campushub.backend.models.cart;

import com.campushub.backend.models.listings.Listing;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;

class CartItemTest {

    @Test
    void settersAndGetters_storeValues() {
        CartItem cartItem = new CartItem();
        Listing listing = new Listing();
        Cart cart = new Cart();

        cartItem.setListing(listing);
        cartItem.setCart(cart);
        cartItem.setUnitPrice(new BigDecimal("19.99"));
        cartItem.setQuantity(2);

        assertSame(listing, cartItem.getListing());
        assertSame(cart, cartItem.getCart());
        assertEquals(new BigDecimal("19.99"), cartItem.getUnitPrice());
        assertEquals(2, cartItem.getQuantity());
    }
}
