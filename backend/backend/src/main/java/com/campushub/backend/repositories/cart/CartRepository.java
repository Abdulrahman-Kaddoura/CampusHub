package com.campushub.backend.repositories.cart;

import com.campushub.backend.models.cart.Cart;
import com.campushub.backend.models.listings.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartRepository extends JpaRepository<Cart, UUID> {
    Optional<Cart> findByUserId(UUID userId);
}
