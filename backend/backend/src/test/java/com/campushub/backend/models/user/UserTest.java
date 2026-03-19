package com.campushub.backend.models.user;

import com.campushub.backend.enums.user.UserStatus;
import com.campushub.backend.models.courseExchange.CourseExchange;
import com.campushub.backend.models.dorm.Dorm;
import com.campushub.backend.models.listings.Listing;
import com.campushub.backend.models.tutoring.Tutoring;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;

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
    void addDormPost_linksBothSides() {
        User user = new User();
        Dorm dorm = new Dorm();

        user.addDormPost(dorm);

        assertEquals(1, user.getDormPosts().size());
        assertSame(user, dorm.getUser());
    }

    @Test
    void addTutoringPost_linksBothSides() {
        User user = new User();
        Tutoring tutoring = new Tutoring();

        user.addTutoringPost(tutoring);

        assertEquals(1, user.getTutoringPosts().size());
        assertSame(user, tutoring.getUser());
    }

    @Test
    void addCourseExchangePost_linksBothSides() {
        User user = new User();
        CourseExchange courseExchange = new CourseExchange();

        user.addCourseExchangePost(courseExchange);

        assertEquals(1, user.getCourseExchangePosts().size());
        assertSame(user, courseExchange.getUser());
    }

    @Test
    void defaultStatus_isPending() {
        User user = new User();

        assertEquals(UserStatus.PENDING, user.getStatus());
    }

    @Test
    void onCreate_setsAuditFields() {
        User user = new User();

        user.onCreate();

        assertNotNull(user.getCreatedAt());
        assertNotNull(user.getUpdatedAt());
    }

    @Test
    void onUpdate_refreshesUpdatedAt() {
        User user = new User();
        user.setUpdatedAt(LocalDateTime.now().minusDays(1));

        user.onUpdate();

        assertTrue(user.getUpdatedAt().isAfter(LocalDateTime.now().minusHours(1)));
    }
}
