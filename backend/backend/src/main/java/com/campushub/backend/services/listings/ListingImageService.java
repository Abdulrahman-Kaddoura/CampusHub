package com.campushub.backend.services.listings;

import com.campushub.backend.models.listings.Listing;
import com.campushub.backend.models.listings.ListingImage;
import com.campushub.backend.repositories.listing.ListingImageRepository;
import com.campushub.backend.repositories.listing.ListingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ListingImageService {

    @Autowired
    private ListingImageRepository listingImageRepository;

    @Autowired
    private ListingRepository listingRepository;

    @Transactional
    public ListingImage uploadImage(MultipartFile file, UUID listingId) throws IOException {
        System.out.println("[DEBUG][ListingImageService] uploadImage() called — listingId=" + listingId
                + ", fileName=" + file.getOriginalFilename()
                + ", contentType=" + file.getContentType()
                + ", size=" + file.getSize());

        // Validate file
        if (file.isEmpty()) {
            System.out.println("[DEBUG][ListingImageService] REJECTED: file is empty");
            throw new IllegalArgumentException("Cannot upload empty file");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            System.out.println("[DEBUG][ListingImageService] REJECTED: invalid contentType=" + contentType);
            throw new IllegalArgumentException("Only image files are allowed");
        }

        // Validate file size (e.g., max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            System.out.println("[DEBUG][ListingImageService] REJECTED: file too large (" + file.getSize() + " bytes)");
            throw new IllegalArgumentException("File size exceeds maximum limit of 5MB");
        }

        // Find listing
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> {
                    System.out.println("[DEBUG][ListingImageService] FAILED: listing not found for id=" + listingId);
                    return new RuntimeException("Listing not found with id: " + listingId);
                });
        System.out.println("[DEBUG][ListingImageService] Found listing — title='" + listing.getTitle() + "'");

        // Create image entity
        ListingImage image = new ListingImage();
        image.setFileName(file.getOriginalFilename());
        image.setFileType(contentType);
        image.setImageData(file.getBytes());
        image.setFileSize(file.getSize());
        image.setUploadDate(LocalDateTime.now());
        image.setListing(listing);

        ListingImage saved = listingImageRepository.save(image);
        System.out.println("[DEBUG][ListingImageService] Image saved — imageId=" + saved.getImageId()
                + ", listingId=" + listingId);
        return saved;
    }

    @Transactional(readOnly = true)
    public ListingImage getImage(UUID imageId) {
        System.out.println("[DEBUG][ListingImageService] getImage() called — imageId=" + imageId);
        ListingImage img = listingImageRepository.findById(imageId)
                .orElseThrow(() -> {
                    System.out.println("[DEBUG][ListingImageService] FAILED: image not found for id=" + imageId);
                    return new RuntimeException("Image not found with id: " + imageId);
                });
        System.out.println("[DEBUG][ListingImageService] Found image — fileName=" + img.getFileName()
                + ", fileType=" + img.getFileType()
                + ", size=" + img.getFileSize());
        return img;
    }

    @Transactional(readOnly = true)
    public List<ListingImage> getImagesByListing(UUID listingId) {
        List<ListingImage> images = listingImageRepository.findByListing_ListingId(listingId);
        System.out.println("[DEBUG][ListingImageService] getImagesByListing() — listingId=" + listingId
                + ", found " + images.size() + " image(s)");
        return images;
    }

    @Transactional
    public ListingImage deleteImage(UUID imageId) {
        ListingImage image = listingImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found with id: " + imageId));

        listingImageRepository.delete(image);
        return image;
    }

    @Transactional
    public void deleteImagesByListing(UUID listingId) {
        listingImageRepository.deleteByListing_ListingId(listingId);
    }
}