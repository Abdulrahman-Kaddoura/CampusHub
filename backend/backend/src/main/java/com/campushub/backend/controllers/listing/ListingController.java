package com.campushub.backend.controllers.listing;

import com.campushub.backend.dtos.listing.ListingRequestDTO;
import com.campushub.backend.dtos.listing.ListingResponseDTO;
import com.campushub.backend.enums.listings.ListingStatus;
import com.campushub.backend.models.listings.Category;
import com.campushub.backend.models.listings.Listing;
import com.campushub.backend.models.user.User;
import com.campushub.backend.services.listings.CategoryService;
import com.campushub.backend.services.listings.ListingService;
import com.campushub.backend.services.user.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;


@RestController
@RequestMapping("/listings")
@Tag(name = "Listings", description = "Listing related operations")
public class ListingController {

    @Autowired
    ListingService listingService;

    @Autowired
    ModelMapper modelMapper;

    @Autowired
    UserService userService;

    @Autowired
    CategoryService categoryService;

    @PostMapping("/create-listing")
    @Operation(
            summary = "Create Listing",
            description = "Creates a new listing for a certain user. Returns the created listing details."
    )
    public ResponseEntity<ListingResponseDTO> createListing(
            @Valid @RequestBody ListingRequestDTO listingRequestDTO) throws Exception {

        User user = userService.findById(listingRequestDTO.getUserId());

        Listing listing = new Listing();
        listing.setTitle(listingRequestDTO.getTitle());
        listing.setDescription(listingRequestDTO.getDescription());
        listing.setPrice(listingRequestDTO.getPrice());
        listing.setUser(user);
        String categoryName = listingRequestDTO.getCategoryName();
        Category category = categoryService.getOrCreateByName(categoryName);
        listing.setCategory(category);
        listing.setListingStatus(ListingStatus.PUBLISHED);

        Listing createdListing = listingService.createListing(listing);

        ListingResponseDTO response = modelMapper.map(createdListing, ListingResponseDTO.class);
        response.setListingId(createdListing.getListingId());
        response.setUserId(createdListing.getUser().getId());
        response.setBuyerId(
                createdListing.getBuyer() != null
                        ? createdListing.getBuyer().getId()
                        : null
        );
        response.setStatus(createdListing.getListingStatus());

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/buy-listing/{listingId}")
    @Operation(
            summary = "Buy Listing",
            description = "Marks a listing as sold to a buyer using the listing ID and buyer ID. Returns the updated listing."
    )
    public ResponseEntity<ListingResponseDTO> buyListing(
            @PathVariable UUID listingId,
            @RequestParam UUID buyerId) throws Exception {
        Listing listing = listingService.buyListing(listingId, buyerId);

        ListingResponseDTO response =
                modelMapper.map(listing, ListingResponseDTO.class);

        response.setListingId(listing.getListingId());
        response.setUserId(listing.getUser().getId());
        response.setBuyerId(
                listing.getBuyer() != null ? listing.getBuyer().getId() : null
        );
        response.setStatus(listing.getListingStatus());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/get-listings")
    @Operation(
            summary = "Get All Listings",
            description = "Retrieves a list of all listings in the system."
    )
    public ResponseEntity<List<ListingResponseDTO>> getAllListings() {
        List<Listing> listings = listingService.getAllListings();
        List<ListingResponseDTO> listingResponseDTOS = listings.stream()
                .map(listing -> {
                    ListingResponseDTO dto = modelMapper.map(listing, ListingResponseDTO.class);
                    dto.setListingId(listing.getListingId());
                    dto.setUserId(listing.getUser().getId());
                    dto.setBuyerId(listing.getBuyer() != null ? listing.getBuyer().getId() : null);
                    dto.setStatus(listing.getListingStatus());
                    if (listing.getListingImages() != null && !listing.getListingImages().isEmpty()) {
                        dto.setFirstImageId(listing.getListingImages().get(0).getImageId());
                    }
                    return dto;
                })
                .toList();
        return new ResponseEntity<>(listingResponseDTOS, HttpStatus.OK);
    }

    @GetMapping("/get-listings-by-user/{userId}")
    @Operation(
            summary = "Get Listings by User",
            description = "Retrieves all listings posted by a specific user using the user ID and returns them in a list."
    )
    public ResponseEntity<List<ListingResponseDTO>> getAllListingsByUser(@PathVariable UUID userId) {
        List<Listing> listings = listingService.getAllListingsByUser(userId);
        List<ListingResponseDTO> listingResponseDTOS = listings.stream()
                .map(listing -> modelMapper.map(listing, ListingResponseDTO.class))
                .toList();
        return new ResponseEntity<>(listingResponseDTOS, HttpStatus.OK);
    }

    @GetMapping("/get-listings-by-category/{categoryName}")
    @Operation(
            summary = "Get Listings by Category",
            description = "Retrieves all listings under a specific category using the category name and returns them in a list."
    )
    public ResponseEntity<List<ListingResponseDTO>> getAllListingsByCategory(@PathVariable String categoryName) {
        List<Listing> listings = listingService.getAllListingsByCategory(categoryName);
        List<ListingResponseDTO> listingResponseDTOS = listings.stream()
                .map(listing -> modelMapper.map(listing, ListingResponseDTO.class))
                .toList();
        return new ResponseEntity<>(listingResponseDTOS, HttpStatus.OK);
    }

    @DeleteMapping("/delete-listing/{listingId}")
    @Operation(
            summary = "Delete Listing",
            description = "Deletes a listing by its ID and returns the deleted listing details."
    )
    public ResponseEntity<ListingResponseDTO> deleteListing(@PathVariable UUID listingId) {
        Listing listing = listingService.deleteListingById(listingId);
        ListingResponseDTO listingResponseDTO = modelMapper.map(listing, ListingResponseDTO.class);
        return new ResponseEntity<>(listingResponseDTO, HttpStatus.OK);
    }
}
