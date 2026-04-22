package com.campushub.backend.repositories.review;

import com.campushub.backend.models.review.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {

    List<Review> findByRevieweeIdOrderByCreatedAtDesc(UUID revieweeId);

    boolean existsByReviewerIdAndListingListingId(UUID reviewerId, UUID listingId);
}
