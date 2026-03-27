package com.campushub.backend.dtos.listing;

import java.util.UUID;

public class AiSearchResultDTO {
    private UUID listingId;
    private double score;

    public AiSearchResultDTO() {
    }

    public AiSearchResultDTO(UUID listingId, double score) {
        this.listingId = listingId;
        this.score = score;
    }

    public UUID getListingId() {
        return listingId;
    }

    public void setListingId(UUID listingId) {
        this.listingId = listingId;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }
}
