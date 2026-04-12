    package com.campushub.backend.controllers.listing;

    import com.campushub.backend.dtos.listingImage.ListingImageResponseDTO;
    import com.campushub.backend.models.listings.ListingImage;
    import com.campushub.backend.services.listings.ListingImageService;
    import io.swagger.v3.oas.annotations.Operation;
    import io.swagger.v3.oas.annotations.tags.Tag;
    import org.modelmapper.ModelMapper;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.http.HttpHeaders;
    import org.springframework.http.HttpStatus;
    import org.springframework.http.MediaType;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.*;
    import org.springframework.web.multipart.MultipartFile;
    import org.togglz.core.manager.FeatureManager;

    import java.io.IOException;
    import java.util.List;
    import java.util.UUID;

    import static com.campushub.backend.configurations.togglz.Features.*;

    @RestController
@RequestMapping({"/listingImage", "/api/listingImage"})
    @Tag(name = "Listing Image", description = "Listing Image related operations")
    public class ListingImageController {

        @Autowired
        ListingImageService listingImageService;

        @Autowired
        ModelMapper modelMapper;

        @Autowired
        FeatureManager featureManager;

        @PostMapping("/upload-listing-image/{listingId}")
        @Operation(
                summary = "Upload Listing Image",
                description = "Uploads an image file for a specific listing by listing ID. Returns the uploaded image metadata."
        )
        public ResponseEntity<ListingImageResponseDTO> uploadImage(@PathVariable UUID listingId,
                @RequestParam("file") MultipartFile file) {
            if (!featureManager.isActive(UPLOAD_LISTING_IMAGE)) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            try {
                ListingImage image = listingImageService.uploadImage(file, listingId);
                ListingImageResponseDTO listingImageResponseDTO = modelMapper.map(image, ListingImageResponseDTO.class);
                return new ResponseEntity<>(listingImageResponseDTO, HttpStatus.CREATED);
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        }

        @GetMapping("/download-listing-image/{imageId}")
        @Operation(
                summary = "Download Listing Image",
                description = "Downloads the image file associated with a listing using its image ID. " +
                        "The response contains the raw image bytes, proper Content-Type, and inline filename " +
                        "so it can be displayed directly in the browser or saved by the client."
        )
        public ResponseEntity<byte[]> downloadImage(@PathVariable UUID imageId) {
            if (!featureManager.isActive(DOWNLOAD_LISTING_IMAGE)) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            try {
                ListingImage image = listingImageService.getImage(imageId);

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(image.getFileType()))
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "inline; filename=\"" + image.getFileName() + "\"")
                        .body(image.getImageData());
            } catch (RuntimeException e) {
                return ResponseEntity.notFound().build();
            }
        }

        @GetMapping("/get-listing-images/{listingId}")
        @Operation(
                summary = "Get Listing Images",
                description = "Retrieves all images associated with a listing by listing ID and returns them in a list."
        )
        public ResponseEntity<List<ListingImageResponseDTO>> getListingImages(@PathVariable UUID listingId) {
            if (!featureManager.isActive(GET_LISTING_IMAGES)) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            List<ListingImage> images = listingImageService.getImagesByListing(listingId);
            List<ListingImageResponseDTO> dtos = images.stream()
                    .map(image -> modelMapper.map(image, ListingImageResponseDTO.class))
                    .toList();
            return new ResponseEntity<>(dtos, HttpStatus.OK);
        }

        @DeleteMapping("/delete-listing-image/{imageId}")
        @Operation(
                summary = "Delete Listing Image",
                description = "Deletes a listing image by its image ID and returns the deleted image metadata."
        )
        public ResponseEntity<ListingImageResponseDTO> deleteImage(@PathVariable UUID imageId) {
            if (!featureManager.isActive(DELETE_LISTING_IMAGE)) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            try {
                ListingImage listingImage = listingImageService.deleteImage(imageId);
                ListingImageResponseDTO listingImageResponseDTO = modelMapper.map(listingImage, ListingImageResponseDTO.class);
                return new ResponseEntity<>(listingImageResponseDTO, HttpStatus.OK);
            } catch (RuntimeException e) {
                return ResponseEntity.notFound().build();
            }
        }
    }
