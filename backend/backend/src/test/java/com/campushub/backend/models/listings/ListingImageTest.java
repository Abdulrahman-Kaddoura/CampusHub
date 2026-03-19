package com.campushub.backend.models.listings;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;

class ListingImageTest {

    @Test
    void allArgsConstructor_setsFields() {
        UUID imageId = UUID.randomUUID();
        byte[] imageData = new byte[]{1, 2, 3};
        LocalDateTime uploadDate = LocalDateTime.now();
        Listing listing = new Listing();

        ListingImage listingImage = new ListingImage(imageId, "book.png", "image/png", imageData, 3L, uploadDate, listing);

        assertEquals(imageId, listingImage.getImageId());
        assertEquals("book.png", listingImage.getFileName());
        assertEquals("image/png", listingImage.getFileType());
        assertArrayEquals(imageData, listingImage.getImageData());
        assertEquals(3L, listingImage.getFileSize());
        assertEquals(uploadDate, listingImage.getUploadDate());
        assertEquals(listing, listingImage.getListing());
    }
}
