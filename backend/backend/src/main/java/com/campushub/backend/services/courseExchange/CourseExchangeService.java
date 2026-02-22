package com.campushub.backend.services.courseExchange;

import com.campushub.backend.models.courseExchange.CourseExchange;
import com.campushub.backend.repositories.courseExchange.CourseExchangeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseExchangeService {

    private final CourseExchangeRepository courseExchangeRepository;

    public CourseExchange createCourseExchange(CourseExchange courseExchange) {
        return courseExchangeRepository.save(courseExchange);
    }

    public List<CourseExchange> getAllCourseExchanges() {
        return courseExchangeRepository.findAll();
    }

    public List<CourseExchange> getAllCourseExchangesByUser(UUID userId) {
        return courseExchangeRepository.findByUserId(userId);
    }

    @Transactional
    public CourseExchange deleteCourseExchangeByIdForUser(UUID courseExchangeId, UUID actingUserId) {
        CourseExchange courseExchange = courseExchangeRepository.findById(courseExchangeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course exchange post not found with id: " + courseExchangeId));

        if (!courseExchange.getUser().getId().equals(actingUserId)) {
            throw new AccessDeniedException("You can only delete your own course exchange posts");
        }

        courseExchangeRepository.delete(courseExchange);
        return courseExchange;
    }
}
