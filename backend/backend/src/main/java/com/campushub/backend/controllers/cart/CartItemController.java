package com.campushub.backend.controllers.cart;

import com.campushub.backend.dtos.cartItem.CartItemRequestDTO;
import com.campushub.backend.dtos.cartItem.CartItemResponseDTO;
import com.campushub.backend.models.cart.Cart;
import com.campushub.backend.models.cart.CartItem;
import com.campushub.backend.models.listings.Listing;
import com.campushub.backend.services.cart.CartItemService;
import com.campushub.backend.services.cart.CartService;
import com.campushub.backend.services.listings.ListingService;
import com.campushub.backend.services.user.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.togglz.core.manager.FeatureManager;

import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import static com.campushub.backend.configurations.togglz.Features.*;

@RestController
@RequestMapping("/cart-item")
@Tag(name = "Cart Item", description = "Cart Item related operations")
public class CartItemController {
    @Autowired
    CartItemService cartItemService;

    @Autowired
    CartService cartService;

    @Autowired
    ModelMapper modelMapper;

    @Autowired
    ListingService listingService;

    @Autowired
    FeatureManager featureManager;

    @Autowired
    UserService userService;

    @PostMapping("/create-cart-item")
    @Operation(summary = "Create cart item",
            description = "Adds a cart item into a specific cart using the carts id. Returns the created cart item's details.")
    public ResponseEntity<CartItemResponseDTO> createCartItem(@Valid @RequestBody CartItemRequestDTO cartItemRequestDTO) {
        if (!featureManager.isActive(CREATE_CART_ITEM)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        CartItem cartItem = modelMapper.map(cartItemRequestDTO, CartItem.class);
        Cart cart = cartService.findCartById(cartItemRequestDTO.getCartId());
        userService.requireAuthenticatedUser(cart.getUser().getId());
        cartItem.setCart(cart);
        Listing listing = listingService.getListingById(cartItemRequestDTO.getListingId());
        cartItem.setListing(listing);
        if (cartItem.getUnitPrice() == null) {
            cartItem.setUnitPrice(listing.getPrice());
        }
        CartItem createdCartItem = cartItemService.createCartItem(cartItem);
        CartItemResponseDTO cartItemResponseDTO = modelMapper.map(createdCartItem, CartItemResponseDTO.class);
        cartItemResponseDTO.setCartItemId(createdCartItem.getCartItemId());
        cartItemResponseDTO.setListingId(createdCartItem.getListing().getListingId());
        cartItemResponseDTO.setParentCartId(createdCartItem.getCart().getCartId());
        cartItemResponseDTO.setTotalPrice(createdCartItem.getUnitPrice()
                .multiply(BigDecimal.valueOf(createdCartItem.getQuantity())));
        return new ResponseEntity<>(cartItemResponseDTO, HttpStatus.OK);
    }

    @DeleteMapping("/delete-cart-item/{cartItemId}")
    @Operation(summary = "Delete Cart Item",
             description = "Removes a cart item from a cart using its UUID. Returns the deleted cart item's details.")
    public ResponseEntity<CartItemResponseDTO> deleteCartItem(@PathVariable UUID cartItemId) {
        if (!featureManager.isActive(DELETE_CART_ITEM)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        CartItem cartItem = cartItemService.findById(cartItemId);
        Cart cart = cartService.findCartById(cartItem.getCart().getCartId());
        userService.requireAuthenticatedUser(cart.getUser().getId());
        BigDecimal totalPrice = cart.getTotalPrice();
        CartItem deletedCartItem = cartItemService.deleteCartItem(cartItemId);
        CartItemResponseDTO cartItemResponseDTO = modelMapper.map(deletedCartItem, CartItemResponseDTO.class);
        cartItemResponseDTO.setTotalPrice(totalPrice);
        cartItemResponseDTO.setParentCartId(cart.getCartId());
        return new ResponseEntity<>(cartItemResponseDTO, HttpStatus.OK);
    }

    @GetMapping("/get-cart-items/{cartId}")
    @Operation(summary = "Get Cart Items",
            description = "Retrieves all items in the cart by the given cart ID and returns them all in a set.")
    public ResponseEntity<Set<CartItemResponseDTO>> getCartItems(@PathVariable UUID cartId) {

        if (!featureManager.isActive(GET_CART_ITEMS)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        Cart cart = cartService.findCartById(cartId);
        userService.requireAuthenticatedUser(cart.getUser().getId());
        Set<CartItem> cartItems = cart.getCartItems();

        Set<CartItemResponseDTO> response = cartItems.stream()
                .map(item -> {
                    CartItemResponseDTO dto = modelMapper.map(item, CartItemResponseDTO.class);
                    dto.setListingId(item.getListing().getListingId());
                    dto.setTotalPrice(
                            item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()))
                    );
                    return dto;
                })
                .collect(Collectors.toSet());

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
