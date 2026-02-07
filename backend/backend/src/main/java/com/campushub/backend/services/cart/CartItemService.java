package com.campushub.backend.services.cart;

import com.campushub.backend.exceptions.cartItem.CartItemIdNullException;
import com.campushub.backend.exceptions.cartItem.CartItemNotFoundException;
import com.campushub.backend.exceptions.cart.CartNotFoundException;
import com.campushub.backend.models.cart.Cart;
import com.campushub.backend.models.cart.CartItem;
import com.campushub.backend.repositories.cart.CartItemRepository;
import com.campushub.backend.repositories.cart.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.UUID;

@Service
public class CartItemService {

    @Autowired
    CartItemRepository cartItemRepository;

    @Autowired
    CartRepository cartRepository;

    @Transactional
    public CartItem createCartItem(CartItem cartItem) {
        if (cartItem.getListing() == null || cartItem.getListing().getListingId() == null) {
            throw new IllegalArgumentException("Listing is required to create a cart item");
        }
        Cart cart = cartRepository.findById(cartItem.getCart().getCartId())
                .orElseThrow(() -> new CartNotFoundException("Cart not found"));
        if (cart.getCartItems() == null) {
            cart.setCartItems(new HashSet<>());
        }
        if (cartItem.getQuantity() <= 0 || cartItem.getUnitPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Quantity and unit price must be greater than 0");
        }
        cartItem.setCart(cart);
        cart.getCartItems().add(cartItem);
        BigDecimal itemTotalPrice = cartItem.getUnitPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
        cart.setTotalPrice(cart.getTotalPrice().add(itemTotalPrice));
        cart.setListingsQuantity(cart.getListingsQuantity() + cartItem.getQuantity());
        cartItem.setCartItemId(null);
        CartItem savedCartItem = cartItemRepository.save(cartItem);
        cartRepository.save(cart);
        return savedCartItem;
    }

    public CartItem deleteCartItem(UUID cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new CartItemNotFoundException("Cart Item not found with id: " + cartItemId));
        Cart cart = cartRepository.findById(cartItem.getCart().getCartId())
                .orElseThrow(() -> new CartNotFoundException("Cart not found"));
        BigDecimal itemTotalPrice = cartItem.getUnitPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
        cart.setTotalPrice(cart.getTotalPrice().subtract(itemTotalPrice));
        cart.setListingsQuantity(cart.getListingsQuantity() - cartItem.getQuantity());
        cartItemRepository.deleteById(cartItemId);
        return cartItem;
    }

    public CartItem findById(UUID cartItemId) {
        if (cartItemId == null) {
            throw new CartItemIdNullException("CartItem ID must not be null");
        }

        return cartItemRepository.findById(cartItemId)
                .orElseThrow(() ->
                        new CartItemNotFoundException(
                                "CartItem not found with id: " + cartItemId));
    }
}
