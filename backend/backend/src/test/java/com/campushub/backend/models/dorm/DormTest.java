package com.campushub.backend.models.dorm;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DormTest {

    @Test
    void onCreate_setsCreatedAndUpdatedAt() {
        Dorm dorm = new Dorm();

        dorm.onCreate();

        assertNotNull(dorm.getCreatedAt());
        assertNotNull(dorm.getUpdatedAt());
    }

    @Test
    void onUpdate_refreshesUpdatedAt() {
        Dorm dorm = new Dorm();
        dorm.setUpdatedAt(LocalDateTime.now().minusDays(1));

        dorm.onUpdate();

        assertTrue(dorm.getUpdatedAt().isAfter(LocalDateTime.now().minusHours(1)));
    }
}
