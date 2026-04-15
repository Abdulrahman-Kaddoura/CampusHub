package com.campushub.backend.repositories.cart;

import com.campushub.backend.models.cart.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, UUID> {
    boolean existsByCartCartIdAndListingListingId(UUID cartId, UUID listingId);
}
