package com.campushub.backend.controllers.tutoring;

import com.campushub.backend.dtos.tutoring.TutoringRequestDTO;
import com.campushub.backend.dtos.tutoring.TutoringResponseDTO;
import com.campushub.backend.models.tutoring.Tutoring;
import com.campushub.backend.models.user.User;
import com.campushub.backend.services.listings.HuggingFaceContentModerationService;
import com.campushub.backend.services.tutoring.TutoringService;
import com.campushub.backend.services.user.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.togglz.core.manager.FeatureManager;

import java.util.List;
import java.util.UUID;

import static com.campushub.backend.configurations.togglz.Features.*;

@RestController
@RequestMapping("/tutoring")
@Tag(name = "Tutoring", description = "Tutoring related operations")
@RequiredArgsConstructor
public class TutoringController {

    private static final Logger log = LoggerFactory.getLogger(TutoringController.class);

    private final TutoringService tutoringService;
    private final UserService userService;
    private final ModelMapper modelMapper;
    private final FeatureManager featureManager;
    private final HuggingFaceContentModerationService contentModerationService;

    @PostMapping("/create-tutoring")
    @Operation(summary = "Create tutoring post", description = "Creates a tutoring post for the authenticated user.")
    public ResponseEntity<TutoringResponseDTO> createTutoring(@Valid @RequestBody TutoringRequestDTO requestDTO) {
        // DEBUG: check feature toggle — if CREATE_TUTORING is disabled this returns 403 immediately
        boolean createTutoringEnabled = featureManager.isActive(CREATE_TUTORING);
        log.debug("[DEBUG] createTutoring: CREATE_TUTORING feature toggle active = {}", createTutoringEnabled);
        if (!createTutoringEnabled) {
            log.debug("[DEBUG] createTutoring: returning 403 because CREATE_TUTORING feature toggle is disabled");
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        String textToScreen = requestDTO.getTutorName() + " "
                + (requestDTO.getDescription() != null ? requestDTO.getDescription() : "");
        if (!contentModerationService.isAppropriate(textToScreen)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tutoring post contains inappropriate content.");
        }

        userService.requireNotSuspended();
        User user = userService.getAuthenticatedUser();
        // DEBUG: log the authenticated user and the userId from the request to detect mismatches
        log.debug("[DEBUG] createTutoring: authenticated user id = {}", user.getId());
        log.debug("[DEBUG] createTutoring: request userId = {}", requestDTO.getUserId());
        if (!requestDTO.getUserId().equals(user.getId())) {
            log.debug("[DEBUG] createTutoring: returning 403 because request userId '{}' does not match authenticated user id '{}'",
                    requestDTO.getUserId(), user.getId());
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only create tutoring posts for your own account");
        }

        Tutoring tutoring = modelMapper.map(requestDTO, Tutoring.class);
        tutoring.setUser(user);

        Tutoring createdTutoring = tutoringService.createTutoring(tutoring);
        TutoringResponseDTO responseDTO = modelMapper.map(createdTutoring, TutoringResponseDTO.class);
        responseDTO.setTutoringId(createdTutoring.getTutoringId());
        responseDTO.setUserId(createdTutoring.getUser().getId());

        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    @GetMapping("/get-tutoring")
    @Operation(summary = "Get all tutoring posts", description = "Retrieves all tutoring posts.")
    public ResponseEntity<List<TutoringResponseDTO>> getAllTutoring() {
        if (!featureManager.isActive(GET_ALL_TUTORING)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        List<TutoringResponseDTO> response = tutoringService.getAllTutoringPosts().stream()
                .map(tutoring -> {
                    TutoringResponseDTO dto = modelMapper.map(tutoring, TutoringResponseDTO.class);
                    dto.setTutoringId(tutoring.getTutoringId());
                    dto.setUserId(tutoring.getUser().getId());
                    return dto;
                })
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/get-tutoring-by-user/{userId}")
    @Operation(summary = "Get tutoring posts by user", description = "Retrieves tutoring posts for a specific user.")
    public ResponseEntity<List<TutoringResponseDTO>> getAllTutoringByUser(@PathVariable UUID userId) {
        if (!featureManager.isActive(GET_ALL_TUTORING_BY_USER)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        userService.requireAuthenticatedUser(userId);

        List<TutoringResponseDTO> response = tutoringService.getAllTutoringPostsByUser(userId).stream()
                .map(tutoring -> {
                    TutoringResponseDTO dto = modelMapper.map(tutoring, TutoringResponseDTO.class);
                    dto.setTutoringId(tutoring.getTutoringId());
                    dto.setUserId(tutoring.getUser().getId());
                    return dto;
                })
                .toList();

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete-tutoring/{tutoringId}")
    @Operation(summary = "Delete tutoring post", description = "Deletes a tutoring post owned by the authenticated user.")
    public ResponseEntity<TutoringResponseDTO> deleteTutoring(@PathVariable UUID tutoringId) {
        if (!featureManager.isActive(DELETE_TUTORING)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        User actingUser = userService.getAuthenticatedUser();
        Tutoring deletedTutoring = tutoringService.deleteTutoringByIdForUser(tutoringId, actingUser.getId());

        TutoringResponseDTO responseDTO = modelMapper.map(deletedTutoring, TutoringResponseDTO.class);
        responseDTO.setTutoringId(deletedTutoring.getTutoringId());
        responseDTO.setUserId(deletedTutoring.getUser().getId());

        return ResponseEntity.ok(responseDTO);
    }
}
