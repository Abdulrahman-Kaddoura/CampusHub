package com.campushub.backend.controllers.dorm;

import com.campushub.backend.dtos.dorm.DormRequestDTO;
import com.campushub.backend.dtos.dorm.DormResponseDTO;
import com.campushub.backend.models.dorm.Dorm;
import com.campushub.backend.models.user.User;
import com.campushub.backend.services.dorm.DormService;
import com.campushub.backend.services.listings.HuggingFaceContentModerationService;
import com.campushub.backend.services.user.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.togglz.core.manager.FeatureManager;

import java.util.List;
import java.util.UUID;

import static com.campushub.backend.configurations.togglz.Features.*;

@RestController
@RequestMapping("/dorm")
@Tag(name = "Dorm", description = "Dorm related operations")
@RequiredArgsConstructor
public class DormController {

    private static final Logger log = LoggerFactory.getLogger(DormController.class);

    private final DormService dormService;
    private final UserService userService;
    private final ModelMapper modelMapper;
    private final FeatureManager featureManager;
    private final HuggingFaceContentModerationService contentModerationService;

    @PostMapping("/create-dorm")
    @Operation(summary = "Create Dorm Listing", description = "Creates a dorm listing for the authenticated user.")
    public ResponseEntity<DormResponseDTO> createDorm(@Valid @RequestBody DormRequestDTO dormRequestDTO) {
        // DEBUG: check feature toggle — if CREATE_DORM is disabled this returns 403 immediately
        boolean createDormEnabled = featureManager.isActive(CREATE_DORM);
        log.debug("[DEBUG] createDorm: CREATE_DORM feature toggle active = {}", createDormEnabled);
        if (!createDormEnabled) {
            log.debug("[DEBUG] createDorm: returning 403 because CREATE_DORM feature toggle is disabled");
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        String textToScreen = dormRequestDTO.getTitle() + " "
                + (dormRequestDTO.getDescription() != null ? dormRequestDTO.getDescription() : "");
        if (!contentModerationService.isAppropriate(textToScreen)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dorm listing contains inappropriate content.");
        }

        userService.requireNotSuspended();
        User user = userService.getAuthenticatedUser();
        // DEBUG: log the authenticated user and the userId from the request to detect mismatches
        log.debug("[DEBUG] createDorm: authenticated user id = {}", user.getId());
        log.debug("[DEBUG] createDorm: request userId = {}", dormRequestDTO.getUserId());
        if (!dormRequestDTO.getUserId().equals(user.getId())) {
            log.debug("[DEBUG] createDorm: returning 403 because request userId '{}' does not match authenticated user id '{}'",
                    dormRequestDTO.getUserId(), user.getId());
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only create dorm listings for your own account");
        }

        Dorm dorm = modelMapper.map(dormRequestDTO, Dorm.class);
        dorm.setUser(user);

        Dorm createdDorm = dormService.createDorm(dorm);
        DormResponseDTO responseDTO = modelMapper.map(createdDorm, DormResponseDTO.class);
        responseDTO.setDormId(createdDorm.getDormId());
        responseDTO.setUserId(createdDorm.getUser().getId());

        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    @GetMapping("/get-dorms")
    @Operation(summary = "Get all dorm listings", description = "Retrieves all dorm listings.")
    public ResponseEntity<List<DormResponseDTO>> getAllDorms() {
        if (!featureManager.isActive(GET_ALL_DORMS)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        List<DormResponseDTO> response = dormService.getAllDorms().stream()
                .map(dorm -> {
                    DormResponseDTO dto = modelMapper.map(dorm, DormResponseDTO.class);
                    dto.setDormId(dorm.getDormId());
                    dto.setUserId(dorm.getUser().getId());
                    return dto;
                })
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/get-dorms-by-user/{userId}")
    @Operation(summary = "Get dorm listings by user", description = "Retrieves all dorm listings for a specific user.")
    public ResponseEntity<List<DormResponseDTO>> getDormsByUser(@PathVariable UUID userId) {
        if (!featureManager.isActive(GET_ALL_DORMS_BY_USER)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        userService.requireAuthenticatedUser(userId);

        List<DormResponseDTO> response = dormService.getAllDormsByUser(userId).stream()
                .map(dorm -> {
                    DormResponseDTO dto = modelMapper.map(dorm, DormResponseDTO.class);
                    dto.setDormId(dorm.getDormId());
                    dto.setUserId(dorm.getUser().getId());
                    return dto;
                })
                .toList();

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete-dorm/{dormId}")
    @Operation(summary = "Delete dorm listing", description = "Deletes a dorm listing owned by the authenticated user.")
    public ResponseEntity<DormResponseDTO> deleteDorm(@PathVariable UUID dormId) {
        if (!featureManager.isActive(DELETE_DORM)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        User actingUser = userService.getAuthenticatedUser();
        Dorm deletedDorm = dormService.deleteDormByIdForUser(dormId, actingUser.getId());

        DormResponseDTO responseDTO = modelMapper.map(deletedDorm, DormResponseDTO.class);
        responseDTO.setDormId(deletedDorm.getDormId());
        responseDTO.setUserId(deletedDorm.getUser().getId());

        return ResponseEntity.ok(responseDTO);
    }
}