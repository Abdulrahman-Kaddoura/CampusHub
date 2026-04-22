package com.campushub.backend.services.review;

import com.campushub.backend.dtos.review.CreateReviewDTO;
import com.campushub.backend.dtos.review.ReviewResponseDTO;
import com.campushub.backend.enums.listings.ListingStatus;
import com.campushub.backend.models.listings.Listing;
import com.campushub.backend.models.review.Review;
import com.campushub.backend.models.user.User;
import com.campushub.backend.repositories.listing.ListingRepository;
import com.campushub.backend.repositories.review.ReviewRepository;
import com.campushub.backend.services.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ListingRepository listingRepository;
    private final UserService userService;

    @Transactional
    public ReviewResponseDTO createReview(CreateReviewDTO dto) {
        User reviewer = userService.getAuthenticatedUser();

        Listing listing = listingRepository.findById(dto.getListingId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found"));

        if (!ListingStatus.SOLD.equals(listing.getListingStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You can only review a seller after a completed purchase");
        }

        if (listing.getBuyer() == null || !listing.getBuyer().getId().equals(reviewer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the buyer of this listing can leave a review");
        }

        if (listing.getUser().getId().equals(reviewer.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot review yourself");
        }

        if (reviewRepository.existsByReviewerIdAndListingListingId(reviewer.getId(), listing.getListingId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already reviewed this transaction");
        }

        Review review = new Review();
        review.setReviewer(reviewer);
        review.setReviewee(listing.getUser());
        review.setListing(listing);
        review.setRating(dto.getRating());
        review.setComment(dto.getComment());

        Review saved = reviewRepository.save(review);
        return toDTO(saved);
    }

    public List<ReviewResponseDTO> getReviewsForUser(UUID userId) {
        return reviewRepository.findByRevieweeIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public boolean canReview(UUID listingId) {
        User reviewer = userService.getAuthenticatedUser();
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found"));

        if (!ListingStatus.SOLD.equals(listing.getListingStatus())) return false;
        if (listing.getBuyer() == null || !listing.getBuyer().getId().equals(reviewer.getId())) return false;
        if (listing.getUser().getId().equals(reviewer.getId())) return false;
        if (reviewRepository.existsByReviewerIdAndListingListingId(reviewer.getId(), listingId)) return false;
        return true;
    }

    private ReviewResponseDTO toDTO(Review review) {
        ReviewResponseDTO dto = new ReviewResponseDTO();
        dto.setReviewId(review.getReviewId());
        dto.setReviewerId(review.getReviewer().getId());

        String reviewerName = (review.getReviewer().getFirstName() + " " + review.getReviewer().getLastName()).trim();
        if (reviewerName.isEmpty()) reviewerName = review.getReviewer().getUsername();
        dto.setReviewerName(reviewerName);

        dto.setRevieweeId(review.getReviewee().getId());
        dto.setListingId(review.getListing().getListingId());
        dto.setListingTitle(review.getListing().getTitle());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setCreatedAt(review.getCreatedAt());
        return dto;
    }
}
