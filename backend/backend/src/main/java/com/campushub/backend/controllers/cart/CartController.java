package com.campushub.backend.controllers.cart;

import com.campushub.backend.dtos.cart.CartResponseDTO;
import com.campushub.backend.models.cart.Cart;
import com.campushub.backend.services.cart.CartService;
import com.campushub.backend.services.user.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.togglz.core.manager.FeatureManager;


import java.util.UUID;

import static com.campushub.backend.configurations.togglz.Features.*;

@RestController
@RequestMapping("/cart")
@Tag(name = "Cart", description = "Cart related operations")
public class CartController {
    @Autowired
    CartService cartService;

    @Autowired
    ModelMapper modelMapper;

    @Autowired
    FeatureManager featureManager;

    @Autowired
    UserService userService;


    @GetMapping("/get-cart-by-cart-id/{cartId}")
    public ResponseEntity<CartResponseDTO> getCartByCartId(@PathVariable UUID cartId) {
        if (!featureManager.isActive(GET_CART_BY_CART_ID)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        Cart cart = cartService.findCartById(cartId);
        userService.requireAuthenticatedUser(cart.getUser().getId());
        CartResponseDTO cartResponseDTO = modelMapper.map(cart, CartResponseDTO.class);
        return new ResponseEntity<>(cartResponseDTO, HttpStatus.OK);
    }

    @GetMapping("/get-cart-by-user-id/{userId}")
    public ResponseEntity<CartResponseDTO> getCartByUserId(@PathVariable UUID userId) {
        if (!featureManager.isActive(GET_CART_BY_USER_ID)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        userService.requireAuthenticatedUser(userId);
        Cart cart = cartService.findCartByUserId(userId);
        CartResponseDTO cartResponseDTO = modelMapper.map(cart, CartResponseDTO.class);
        return new ResponseEntity<>(cartResponseDTO, HttpStatus.OK);
    }
}
