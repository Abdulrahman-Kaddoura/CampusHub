package com.campushub.backend.repositories.tutoring;

import com.campushub.backend.models.tutoring.Tutoring;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TutoringRepository extends JpaRepository<Tutoring, UUID> {
    List<Tutoring> findByUserId(UUID userId);
}
