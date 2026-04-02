package com.campushub.backend.controllers.listing;

import com.campushub.backend.dtos.listing.AiSearchResultDTO;
import com.campushub.backend.dtos.listing.ListingRequestDTO;
import com.campushub.backend.dtos.listing.ListingResponseDTO;
import com.campushub.backend.dtos.listing.StripeCheckoutRequestDTO;
import com.campushub.backend.dtos.listing.StripeCheckoutResponseDTO;
import com.campushub.backend.models.listings.ListingImage;
import com.campushub.backend.enums.listings.ListingStatus;
import com.campushub.backend.models.listings.Category;
import com.campushub.backend.models.listings.Listing;
import com.campushub.backend.models.user.User;
import com.campushub.backend.services.listings.CategoryService;
import com.campushub.backend.services.listings.HuggingFaceContentModerationService;
import com.campushub.backend.services.listings.HuggingFaceSearchService;
import com.campushub.backend.services.listings.ListingService;
import com.campushub.backend.services.user.UserService;
import com.campushub.backend.services.payment.StripeCheckoutService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.togglz.core.manager.FeatureManager;


import java.util.List;

import com.stripe.exception.StripeException;
import java.util.UUID;

import static com.campushub.backend.configurations.togglz.Features.*;

@RestController
@RequestMapping("/listings")
@Tag(name = "Listings", description = "Listing related operations")
public class ListingController {

    private static final Logger log = LoggerFactory.getLogger(ListingController.class);

    private ListingResponseDTO toListingResponseDTO(Listing listing) {
        ListingResponseDTO response = modelMapper.map(listing, ListingResponseDTO.class);

        if (listing.getListingImages() != null && !listing.getListingImages().isEmpty()) {
            ListingImage firstImage = listing.getListingImages().get(0);
            response.setFirstImageId(firstImage.getImageId());
        }

        return response;
    }

    @Autowired
    ListingService listingService;

    @Autowired
    ModelMapper modelMapper;

    @Autowired
    UserService userService;

    @Autowired
    FeatureManager featureManager;

    @Autowired
    CategoryService categoryService;

    @Autowired
    StripeCheckoutService stripeCheckoutService;

    @Autowired
    HuggingFaceSearchService huggingFaceSearchService;

    @Autowired
    HuggingFaceContentModerationService contentModerationService;

    @PostMapping("/create-listing")
    @Operation(
            summary = "Create Listing",
            description = "Creates a new listing for a certain user. Returns the created listing details."
    )
    public ResponseEntity<ListingResponseDTO> createListing(
            @Valid @RequestBody ListingRequestDTO listingRequestDTO) throws Exception {

        User user;
        try {
            user = userService.getAuthenticatedUser();
        } catch (Exception ex) {
            if (listingRequestDTO.getUserId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId is required when not authenticated");
            }
            user = userService.findById(listingRequestDTO.getUserId());
        }

        String textToScreen = listingRequestDTO.getTitle() + " "
                + (listingRequestDTO.getDescription() != null ? listingRequestDTO.getDescription() : "");
        if (!contentModerationService.isAppropriate(textToScreen)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Listing contains inappropriate content.");
        }

        Listing listing = new Listing();
        listing.setTitle(listingRequestDTO.getTitle());
        listing.setDescription(listingRequestDTO.getDescription());
        listing.setPrice(listingRequestDTO.getPrice());
        listing.setUser(user);
        String categoryName = listingRequestDTO.getCategoryName();
        Category category = categoryService.findCategoryByName(categoryName);
        if (category == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found: " + categoryName);
        }
        listing.setCategory(category);
        listing.setListingStatus(ListingStatus.PUBLISHED);

        Listing createdListing = listingService.createListing(listing);

        ListingResponseDTO response = toListingResponseDTO(createdListing);
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
            @PathVariable UUID listingId) throws Exception {
        if (!featureManager.isActive(BUY_LISTING)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        User buyer = userService.getAuthenticatedUser();
        Listing listing = listingService.buyListing(listingId, buyer.getId());

        ListingResponseDTO response = toListingResponseDTO(listing);

        response.setListingId(listing.getListingId());
        response.setUserId(listing.getUser().getId());
        response.setBuyerId(
                listing.getBuyer() != null ? listing.getBuyer().getId() : null
        );
        response.setStatus(listing.getListingStatus());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/create-checkout-session/{listingId}")
    @Operation(
            summary = "Create Stripe checkout session",
            description = "Creates a Stripe Checkout session for a listing purchase."
    )
    public ResponseEntity<StripeCheckoutResponseDTO> createCheckoutSession(
            @PathVariable UUID listingId,
            @RequestBody(required = false) StripeCheckoutRequestDTO requestDTO) throws StripeException {
        if (!featureManager.isActive(BUY_LISTING)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        User buyer = userService.getAuthenticatedUser();
        Listing listing = listingService.getListingById(listingId);

        if (listing.getUser() != null && listing.getUser().getId().equals(buyer.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot buy your own listing");
        }

        StripeCheckoutResponseDTO responseDTO = stripeCheckoutService.createCheckoutSession(
                listing,
                buyer.getId(),
                requestDTO != null ? requestDTO.getSuccessUrl() : null,
                requestDTO != null ? requestDTO.getCancelUrl() : null
        );

        return ResponseEntity.ok(responseDTO);
    }

    @GetMapping("/get-listings")
    @Operation(
            summary = "Get All Listings",
            description = "Retrieves a list of all listings in the system."
    )
    public ResponseEntity<List<ListingResponseDTO>> getAllListings() {
        if (!featureManager.isActive(GET_ALL_LISTINGS)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        List<Listing> listings = listingService.getAllListings();
        List<ListingResponseDTO> listingResponseDTOS = listings.stream()
                .map(this::toListingResponseDTO)
                .toList();
        return new ResponseEntity<>(listingResponseDTOS, HttpStatus.OK);
    }

    @GetMapping("/get-listings-by-user/{userId}")
    @Operation(
            summary = "Get Listings by User",
            description = "Retrieves all listings posted by a specific user using the user ID and returns them in a list."
    )
    public ResponseEntity<List<ListingResponseDTO>> getAllListingsByUser(@PathVariable UUID userId) {
        if (!featureManager.isActive(GET_ALL_LISTINGS_BY_USER)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        userService.requireAuthenticatedUser(userId);
        List<Listing> listings = listingService.getAllListingsByUser(userId);
        List<ListingResponseDTO> listingResponseDTOS = listings.stream()
                .map(this::toListingResponseDTO)
                .toList();
        return new ResponseEntity<>(listingResponseDTOS, HttpStatus.OK);
    }

    @GetMapping("/get-listings-by-category/{categoryName}")
    @Operation(
            summary = "Get Listings by Category",
            description = "Retrieves all listings under a specific category using the category name and returns them in a list."
    )
    public ResponseEntity<List<ListingResponseDTO>> getAllListingsByCategory(@PathVariable String categoryName) {
        if (!featureManager.isActive(GET_ALL_LISTINGS_BY_CATEGORY)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        List<Listing> listings = listingService.getAllListingsByCategory(categoryName);
        List<ListingResponseDTO> listingResponseDTOS = listings.stream()
                .map(this::toListingResponseDTO)
                .toList();
        return new ResponseEntity<>(listingResponseDTOS, HttpStatus.OK);
    }


    @GetMapping("/ai-search")
    @Operation(
            summary = "AI search listings",
            description = "Ranks listings using Hugging Face semantic search for the provided query."
    )
    public ResponseEntity<List<AiSearchResultDTO>> aiSearchListings(
            @RequestParam("q") String query,
            @RequestParam(name = "limit", defaultValue = "25") int limit
    ) {
        if (!featureManager.isActive(AI_SEARCH_LISTINGS)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        String normalizedQuery = query == null ? "" : query.trim();
        if (normalizedQuery.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        int safeLimit = Math.max(1, Math.min(limit, 50));

        try {
            List<Listing> listings = listingService.getAllListings();
            List<AiSearchResultDTO> ranked = huggingFaceSearchService.rankListings(normalizedQuery, listings)
                    .stream()
                    .limit(safeLimit)
                    .toList();
            return ResponseEntity.ok(ranked);
        } catch (IllegalStateException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, ex.getMessage());
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to run Hugging Face AI search");
        }
    }

    @DeleteMapping("/delete-listing/{listingId}")
    @Operation(
            summary = "Delete Listing",
            description = "Deletes a listing by its ID and returns the deleted listing details."
    )
    public ResponseEntity<ListingResponseDTO> deleteListing(@PathVariable UUID listingId) {
        if (!featureManager.isActive(DELETE_LISTING)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        User actingUser = userService.getAuthenticatedUser();
        Listing listing = listingService.deleteListingByIdForUser(listingId, actingUser.getId());
        ListingResponseDTO listingResponseDTO = toListingResponseDTO(listing);
        return new ResponseEntity<>(listingResponseDTO, HttpStatus.OK);
    }
}
