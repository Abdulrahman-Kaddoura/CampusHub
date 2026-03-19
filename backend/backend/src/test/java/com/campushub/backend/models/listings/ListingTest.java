package com.campushub.backend.models.listings;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ListingTest {

    @Test
    void defaults_initializeListingImages() {
        Listing listing = new Listing();

        assertNotNull(listing.getListingImages());
        assertTrue(listing.getListingImages().isEmpty());
    }

    @Test
    void onCreate_setsCreatedAndUpdatedAt() {
        Listing listing = new Listing();

        listing.onCreate();

        assertNotNull(listing.getCreatedAt());
        assertNotNull(listing.getUpdatedAt());
    }

    @Test
    void onUpdate_refreshesUpdatedAt() {
        Listing listing = new Listing();
        listing.setUpdatedAt(LocalDateTime.now().minusDays(1));

        listing.onUpdate();

        assertTrue(listing.getUpdatedAt().isAfter(LocalDateTime.now().minusHours(1)));
    }
}
