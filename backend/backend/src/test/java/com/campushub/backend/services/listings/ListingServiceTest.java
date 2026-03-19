package com.campushub.backend.services.listings;

import com.campushub.backend.enums.listings.ListingStatus;
import com.campushub.backend.exceptions.listing.ListingNotFoundException;
import com.campushub.backend.models.listings.Listing;
import com.campushub.backend.models.user.User;
import com.campushub.backend.repositories.listing.ListingRepository;
import com.campushub.backend.repositories.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ListingServiceTest {

    @Mock
    private ListingRepository listingRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ListingService listingService;

    @Test
    void createListing_setsPublishedStatusWhenMissing() throws Exception {
        User seller = new User();
        seller.setId(UUID.randomUUID());

        Listing listing = new Listing();
        listing.setUser(seller);

        when(listingRepository.save(listing)).thenReturn(listing);

        Listing created = listingService.createListing(listing);

        assertEquals(ListingStatus.PUBLISHED, created.getListingStatus());
        assertEquals(1, seller.getPostedListings().size());
        verify(listingRepository).save(listing);
    }

    @Test
    void getAllListings_returnsRepositoryValues() {
        List<Listing> listings = List.of(new Listing(), new Listing());
        when(listingRepository.findAll()).thenReturn(listings);

        List<Listing> result = listingService.getAllListings();

        assertSame(listings, result);
    }

    @Test
    void deleteListingByIdForUser_throwsForDifferentUser() {
        UUID listingId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        UUID actingUserId = UUID.randomUUID();

        User owner = new User();
        owner.setId(ownerId);

        Listing listing = new Listing();
        listing.setUser(owner);

        when(listingRepository.findById(listingId)).thenReturn(Optional.of(listing));

        assertThrows(AccessDeniedException.class,
                () -> listingService.deleteListingByIdForUser(listingId, actingUserId));

        verify(listingRepository, never()).delete(listing);
    }

    @Test
    void deleteListingById_throwsWhenMissing() {
        UUID listingId = UUID.randomUUID();
        when(listingRepository.findById(listingId)).thenReturn(Optional.empty());

        assertThrows(ListingNotFoundException.class, () -> listingService.deleteListingById(listingId));
    }

    @Test
    void buyListing_setsBuyerAndMarksSold() throws Exception {
        UUID listingId = UUID.randomUUID();
        UUID buyerId = UUID.randomUUID();

        User seller = new User();
        seller.setId(UUID.randomUUID());

        User buyer = new User();
        buyer.setId(buyerId);

        Listing listing = new Listing();
        listing.setUser(seller);
        listing.setListingStatus(ListingStatus.PUBLISHED);

        when(listingRepository.findById(listingId)).thenReturn(Optional.of(listing));
        when(userRepository.findById(buyerId)).thenReturn(Optional.of(buyer));
        when(listingRepository.save(listing)).thenReturn(listing);

        Listing purchased = listingService.buyListing(listingId, buyerId);

        assertSame(buyer, purchased.getBuyer());
        assertEquals(ListingStatus.SOLD, purchased.getListingStatus());
        assertEquals(1, buyer.getPurchasedListings().size());
        verify(listingRepository).save(listing);
    }
}
//real