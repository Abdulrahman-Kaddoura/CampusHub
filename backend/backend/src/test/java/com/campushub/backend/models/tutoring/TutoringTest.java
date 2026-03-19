package com.campushub.backend.models.tutoring;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TutoringTest {

    @Test
    void onCreate_setsCreatedAndUpdatedAt() {
        Tutoring tutoring = new Tutoring();

        tutoring.onCreate();

        assertNotNull(tutoring.getCreatedAt());
        assertNotNull(tutoring.getUpdatedAt());
    }

    @Test
    void onUpdate_refreshesUpdatedAt() {
        Tutoring tutoring = new Tutoring();
        tutoring.setUpdatedAt(LocalDateTime.now().minusDays(1));

        tutoring.onUpdate();

        assertTrue(tutoring.getUpdatedAt().isAfter(LocalDateTime.now().minusHours(1)));
    }
}
