package com.campushub.backend.models.user;

import com.campushub.backend.enums.user.UserStatus;
import com.campushub.backend.models.listings.Listing;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;

class UserTest {

    @Test
    void addListing_linksBothSides() {
        User user = new User();
        Listing listing = new Listing();

        user.addListing(listing);

        assertEquals(1, user.getPostedListings().size());
        assertSame(user, listing.getUser());
    }

    @Test
    void addPurchase_linksBothSides() {
        User user = new User();
        Listing listing = new Listing();

        user.addPurchase(listing);

        assertEquals(1, user.getPurchasedListings().size());
        assertSame(user, listing.getBuyer());
    }

    @Test
    void defaultStatus_isPending() {
        User user = new User();

        assertEquals(UserStatus.PENDING, user.getStatus());
    }
}
