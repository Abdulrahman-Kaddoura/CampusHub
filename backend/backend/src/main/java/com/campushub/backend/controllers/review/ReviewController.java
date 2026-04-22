package com.campushub.backend.controllers.review;

import com.campushub.backend.configurations.togglz.Features;
import com.campushub.backend.dtos.review.CreateReviewDTO;
import com.campushub.backend.dtos.review.ReviewResponseDTO;
import com.campushub.backend.services.review.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.togglz.core.manager.FeatureManager;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/reviews")
@Tag(name = "Reviews", description = "Seller review operations")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private FeatureManager featureManager;

    @PostMapping("/create")
    @Operation(summary = "Create a review", description = "Creates a review for a seller after a completed purchase. Each buyer can review a seller once per listing.")
    public ResponseEntity<ReviewResponseDTO> createReview(@Valid @RequestBody CreateReviewDTO dto) {
        if (!featureManager.isActive(Features.CREATE_REVIEW)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        ReviewResponseDTO response = reviewService.createReview(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get reviews for a user", description = "Returns all reviews received by a seller, ordered by most recent first.")
    public ResponseEntity<List<ReviewResponseDTO>> getReviewsForUser(@PathVariable UUID userId) {
        if (!featureManager.isActive(Features.GET_REVIEWS_BY_USER)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(reviewService.getReviewsForUser(userId));
    }

    @GetMapping("/can-review/{listingId}")
    @Operation(summary = "Check if current user can review a listing", description = "Returns true if the authenticated user is eligible to leave a review for this listing.")
    public ResponseEntity<Boolean> canReview(@PathVariable UUID listingId) {
        if (!featureManager.isActive(Features.CREATE_REVIEW)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(reviewService.canReview(listingId));
    }
}
