package com.campushub.backend.dtos.review;

import java.time.LocalDateTime;
import java.util.UUID;

public class ReviewResponseDTO {

    private UUID reviewId;
    private UUID reviewerId;
    private String reviewerName;
    private UUID revieweeId;
    private UUID listingId;
    private String listingTitle;
    private int rating;
    private String comment;
    private LocalDateTime createdAt;

    public UUID getReviewId() { return reviewId; }
    public void setReviewId(UUID reviewId) { this.reviewId = reviewId; }

    public UUID getReviewerId() { return reviewerId; }
    public void setReviewerId(UUID reviewerId) { this.reviewerId = reviewerId; }

    public String getReviewerName() { return reviewerName; }
    public void setReviewerName(String reviewerName) { this.reviewerName = reviewerName; }

    public UUID getRevieweeId() { return revieweeId; }
    public void setRevieweeId(UUID revieweeId) { this.revieweeId = revieweeId; }

    public UUID getListingId() { return listingId; }
    public void setListingId(UUID listingId) { this.listingId = listingId; }

    public String getListingTitle() { return listingTitle; }
    public void setListingTitle(String listingTitle) { this.listingTitle = listingTitle; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
