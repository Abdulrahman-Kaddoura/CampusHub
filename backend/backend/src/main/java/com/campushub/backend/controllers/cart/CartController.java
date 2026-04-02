package com.campushub.backend.controllers.cart;

import com.campushub.backend.dtos.cart.CartAddItemRequestDTO;
import com.campushub.backend.dtos.cart.CartResponseDTO;
import com.campushub.backend.dtos.cartItem.CartItemResponseDTO;
import com.campushub.backend.dtos.listing.StripeCheckoutRequestDTO;
import com.campushub.backend.dtos.listing.StripeCheckoutResponseDTO;
import com.campushub.backend.models.cart.Cart;
import com.campushub.backend.models.cart.CartItem;
import com.campushub.backend.models.listings.Listing;
import com.campushub.backend.models.user.User;
import com.campushub.backend.services.cart.CartItemService;
import com.campushub.backend.services.cart.CartService;
import com.campushub.backend.services.listings.ListingService;
import com.campushub.backend.services.payment.StripeCheckoutService;
import com.campushub.backend.services.user.UserService;
import com.stripe.exception.StripeException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.togglz.core.manager.FeatureManager;

import java.math.BigDecimal;
import java.util.UUID;

import static com.campushub.backend.configurations.togglz.Features.*;

@RestController
@RequestMapping({"/cart", "/api/cart"})
@Tag(name = "Cart", description = "Cart related operations")
public class CartController {
    @Autowired
    CartService cartService;

    @Autowired
    CartItemService cartItemService;

    @Autowired
    ListingService listingService;

    @Autowired
    StripeCheckoutService stripeCheckoutService;

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

    @PostMapping("/add-item")
    @Operation(
            summary = "Add item to cart",
            description = "Adds a listing to the authenticated user's cart. Returns the created cart item."
    )
    public ResponseEntity<CartItemResponseDTO> addItemToCart(
            @Valid @RequestBody CartAddItemRequestDTO requestDTO) {
        if (!featureManager.isActive(CART_ADD_ITEM)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        User buyer = userService.getAuthenticatedUser();
        Listing listing = listingService.getListingById(requestDTO.getListingId());

        if (listing.getUser() != null && listing.getUser().getId().equals(buyer.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot add your own listing to cart");
        }

        Cart cart = cartService.findCartByUserId(buyer.getId());

        CartItem cartItem = new CartItem();
        cartItem.setCart(cart);
        cartItem.setListing(listing);
        cartItem.setUnitPrice(listing.getPrice());
        cartItem.setQuantity(1);

        CartItem created = cartItemService.createCartItem(cartItem);

        CartItemResponseDTO response = modelMapper.map(created, CartItemResponseDTO.class);
        response.setCartItemId(created.getCartItemId());
        response.setListingId(created.getListing().getListingId());
        response.setListingTitle(created.getListing().getTitle());
        response.setParentCartId(created.getCart().getCartId());
        response.setTotalPrice(created.getUnitPrice().multiply(BigDecimal.valueOf(created.getQuantity())));

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/checkout")
    @Operation(
            summary = "Checkout cart with Stripe",
            description = "Creates a Stripe Checkout session for all items in the authenticated user's cart."
    )
    public ResponseEntity<StripeCheckoutResponseDTO> checkoutCart(
            @RequestBody(required = false) StripeCheckoutRequestDTO requestDTO) throws StripeException {
        if (!featureManager.isActive(CART_CHECKOUT)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        User buyer = userService.getAuthenticatedUser();
        Cart cart = cartService.findCartByUserId(buyer.getId());

        if (cart.getCartItems() == null || cart.getCartItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }

        StripeCheckoutResponseDTO responseDTO = stripeCheckoutService.createCartCheckoutSession(
                cart.getCartItems(),
                buyer.getId(),
                requestDTO != null ? requestDTO.getSuccessUrl() : null,
                requestDTO != null ? requestDTO.getCancelUrl() : null
        );

        return ResponseEntity.ok(responseDTO);
    }

    @PostMapping("/buy")
    @Operation(
            summary = "Finalize cart purchase",
            description = "Marks all listings in the cart as sold and clears the cart. Call after successful Stripe payment."
    )
    public ResponseEntity<CartResponseDTO> buyCart() throws Exception {
        if (!featureManager.isActive(BUY_CART)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        User buyer = userService.getAuthenticatedUser();
        Cart cart = cartService.findCartByUserId(buyer.getId());

        if (cart.getCartItems() == null || cart.getCartItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }

        for (CartItem item : cart.getCartItems().stream().toList()) {
            listingService.buyListing(item.getListing().getListingId(), buyer.getId());
            cartItemService.deleteCartItem(item.getCartItemId());
        }

        Cart updatedCart = cartService.findCartByUserId(buyer.getId());
        CartResponseDTO response = modelMapper.map(updatedCart, CartResponseDTO.class);
        return ResponseEntity.ok(response);
    }
}
