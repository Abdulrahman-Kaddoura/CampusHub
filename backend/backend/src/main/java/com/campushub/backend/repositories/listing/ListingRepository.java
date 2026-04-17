package com.campushub.backend.repositories.listing;

import com.campushub.backend.enums.listings.ListingStatus;
import com.campushub.backend.models.listings.Listing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ListingRepository extends JpaRepository<Listing, UUID> {
    List<Listing> findByUserId(UUID userId);
    List<Listing> findByCategoryName(String categoryName);
    List<Listing> findByListingStatus(ListingStatus listingStatus);
    List<Listing> findByCategoryNameAndListingStatus(String categoryName, ListingStatus listingStatus);
    List<Listing> findByBuyerId(UUID buyerId);
}
