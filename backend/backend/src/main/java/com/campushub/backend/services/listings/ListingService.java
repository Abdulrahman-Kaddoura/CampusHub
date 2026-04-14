package com.campushub.backend.services.listings;

import com.campushub.backend.enums.listings.ListingStatus;
import com.campushub.backend.exceptions.listing.BuyerNotFoundException;
import com.campushub.backend.exceptions.listing.CantBuyOwnListingException;
import com.campushub.backend.exceptions.listing.ListingNotAvailableException;
import com.campushub.backend.exceptions.listing.ListingNotFoundException;
import com.campushub.backend.models.listings.Listing;
import com.campushub.backend.models.user.User;
import com.campushub.backend.repositories.listing.ListingRepository;
import com.campushub.backend.repositories.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ListingService {

    private final ListingRepository listingRepository;
    private final UserRepository userRepository;

    @Transactional
    public Listing createListing(Listing listing) throws Exception {
        if (listing.getUser() == null || listing.getUser().getId() == null) {
            throw new Exception("User must be set before creating listing");
        }

        if (listing.getListingStatus() == null) {
            listing.setListingStatus(ListingStatus.PUBLISHED);
        }

        User user = listing.getUser();
        user.addListing(listing);

        try {
            return listingRepository.save(listing);
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Listing was modified by another transaction. Please retry."
            );
        }
    }

    public List<Listing> getAllListings() {
        System.out.println("[DEBUG][ListingService] getAllListings() called — querying DB for PUBLISHED listings only");
        List<Listing> results = listingRepository.findByListingStatus(ListingStatus.PUBLISHED);
        System.out.println("[DEBUG][ListingService] getAllListings() — DB returned " + results.size() + " PUBLISHED records");
        return results;
    }

    public List<Listing> getAllListingsByUser(UUID userId) {
        System.out.println("[DEBUG][ListingService] getAllListingsByUser() called — userId=" + userId);
        List<Listing> results = listingRepository.findByUserId(userId);
        System.out.println("[DEBUG][ListingService] getAllListingsByUser() — DB returned " + results.size() + " records");
        return results;
    }

    public List<Listing> getAllListingsByCategory(String categoryName) {
        System.out.println("[DEBUG][ListingService] getAllListingsByCategory() called — categoryName='" + categoryName + "', PUBLISHED only");
        List<Listing> results = listingRepository.findByCategoryNameAndListingStatus(categoryName, ListingStatus.PUBLISHED);
        System.out.println("[DEBUG][ListingService] getAllListingsByCategory() — DB returned " + results.size() + " records");
        return results;
    }


    @Transactional
    public Listing deleteListingById(UUID listingId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ListingNotFoundException("Listing not found with id: " + listingId));
        listingRepository.delete(listing);
        return listing;
    }

    @Transactional
    public Listing deleteListingByIdForUser(UUID listingId, UUID actingUserId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ListingNotFoundException("Listing not found with id: " + listingId));

        if (!listing.getUser().getId().equals(actingUserId)) {
            throw new AccessDeniedException("You can only delete your own listings");
        }

        listingRepository.delete(listing);
        return listing;
    }

    public Listing getListingById(UUID listingId) {
        return listingRepository.findById(listingId)
                .orElseThrow(() -> new ListingNotFoundException("Listing not found with id: " + listingId));
    }

    @Transactional
    public Listing buyListing(UUID listingId, UUID buyerId) throws Exception {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ListingNotFoundException("Listing not found with id: " + listingId));

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new BuyerNotFoundException("Buyer not found with id: " + buyerId));

        if (listing.getListingStatus() != ListingStatus.PUBLISHED) {
            throw new ListingNotAvailableException("Listing is not available for purchase");
        }

        if (listing.getUser().getId().equals(buyerId)) {
            throw new CantBuyOwnListingException("Cannot buy your own listing");
        }

        buyer.addPurchase(listing);
        listing.setListingStatus(ListingStatus.SOLD);

        return listingRepository.save(listing);
    }
}