package com.campushub.backend.repositories.dorm;

import com.campushub.backend.models.dorm.Dorm;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DormRepository extends JpaRepository<Dorm, UUID> {
    List<Dorm> findByUserId(UUID userId);
}