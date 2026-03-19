package com.campushub.backend.models.courseExchange;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CourseExchangeTest {

    @Test
    void onCreate_setsCreatedAndUpdatedAt() {
        CourseExchange courseExchange = new CourseExchange();

        courseExchange.onCreate();

        assertNotNull(courseExchange.getCreatedAt());
        assertNotNull(courseExchange.getUpdatedAt());
    }

    @Test
    void onUpdate_refreshesUpdatedAt() {
        CourseExchange courseExchange = new CourseExchange();
        courseExchange.setUpdatedAt(LocalDateTime.now().minusDays(1));

        courseExchange.onUpdate();

        assertTrue(courseExchange.getUpdatedAt().isAfter(LocalDateTime.now().minusHours(1)));
    }
}
