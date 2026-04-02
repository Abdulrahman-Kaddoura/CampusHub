package com.campushub.backend.services.cart;

import com.campushub.backend.exceptions.cart.CartNotFoundException;
import com.campushub.backend.models.cart.Cart;
import com.campushub.backend.models.cart.CartItem;
import com.campushub.backend.repositories.cart.CartRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @InjectMocks
    private CartService cartService;

    // -------------------------------------------------------------------------
    // createCart
    // -------------------------------------------------------------------------

    @Test
    void createCart_savesAndReturnsCart() {
        Cart cart = new Cart();
        when(cartRepository.save(cart)).thenReturn(cart);

        Cart result = cartService.createCart(cart);

        assertSame(cart, result);
        verify(cartRepository).save(cart);
    }

    // -------------------------------------------------------------------------
    // findCartById
    // -------------------------------------------------------------------------

    @Test
    void findCartById_returnsCart_whenFound() {
        UUID cartId = UUID.randomUUID();
        Cart cart = new Cart();
        when(cartRepository.findById(cartId)).thenReturn(Optional.of(cart));

        Cart result = cartService.findCartById(cartId);

        assertSame(cart, result);
    }

    @Test
    void findCartById_throwsCartNotFoundException_whenNotFound() {
        UUID cartId = UUID.randomUUID();
        when(cartRepository.findById(cartId)).thenReturn(Optional.empty());

        assertThrows(CartNotFoundException.class, () -> cartService.findCartById(cartId));
    }

    // -------------------------------------------------------------------------
    // findCartByUserId
    // -------------------------------------------------------------------------

    @Test
    void findCartByUserId_returnsCart_whenFound() {
        UUID userId = UUID.randomUUID();
        Cart cart = new Cart();
        when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));

        Cart result = cartService.findCartByUserId(userId);

        assertSame(cart, result);
    }

    @Test
    void findCartByUserId_throwsCartNotFoundException_whenNotFound() {
        UUID userId = UUID.randomUUID();
        when(cartRepository.findByUserId(userId)).thenReturn(Optional.empty());

        assertThrows(CartNotFoundException.class, () -> cartService.findCartByUserId(userId));
    }

    // -------------------------------------------------------------------------
    // getCartItems
    // -------------------------------------------------------------------------

    @Test
    void getCartItems_returnsItemsFromCart() {
        Cart cart = new Cart();
        CartItem item1 = new CartItem();
        CartItem item2 = new CartItem();
        cart.setCartItems(Set.of(item1, item2));

        Set<CartItem> items = cartService.getCartItems(cart);

        assertEquals(2, items.size());
        assertTrue(items.contains(item1));
        assertTrue(items.contains(item2));
    }

    @Test
    void getCartItems_returnsEmptySet_whenCartHasNoItems() {
        Cart cart = new Cart();
        cart.setCartItems(Set.of());

        Set<CartItem> items = cartService.getCartItems(cart);

        assertNotNull(items);
        assertTrue(items.isEmpty());
    }
}
