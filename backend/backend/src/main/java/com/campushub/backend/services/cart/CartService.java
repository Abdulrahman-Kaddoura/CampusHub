package com.campushub.backend.services.cart;

import com.campushub.backend.exceptions.cart.CartNotFoundException;
import com.campushub.backend.models.cart.Cart;
import com.campushub.backend.models.cart.CartItem;
import com.campushub.backend.repositories.cart.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.UUID;


@Service
public class CartService {
    @Autowired
    CartRepository cartRepository;

    public Cart createCart(Cart cart) {
        return cartRepository.save(cart);
    }

    public Cart findCartById(UUID cartId) {
        return cartRepository.findById(cartId)
                .orElseThrow(() -> new CartNotFoundException(
                        "Cart not found with id: " + cartId
                ));
    }

    public Cart findCartByUserId(UUID userId) {
        return cartRepository.findByUserId(userId)
                .orElseThrow(() -> new CartNotFoundException(
                        "Cart not found with user id: " + userId
                ));
    }

    public Set<CartItem> getCartItems(Cart cart) {
        return cart.getCartItems();
    }
}
