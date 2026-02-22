package com.campushub.backend.repositories.courseExchange;

import com.campushub.backend.models.courseExchange.CourseExchange;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CourseExchangeRepository extends JpaRepository<CourseExchange, UUID> {
    List<CourseExchange> findByUserId(UUID userId);
}
