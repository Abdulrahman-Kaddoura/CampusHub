package com.campushub.backend.controllers.tutoring;

import com.campushub.backend.dtos.tutoring.TutoringRequestDTO;
import com.campushub.backend.dtos.tutoring.TutoringResponseDTO;
import com.campushub.backend.models.tutoring.Tutoring;
import com.campushub.backend.models.user.User;
import com.campushub.backend.services.tutoring.TutoringService;
import com.campushub.backend.services.user.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@RequestMapping("/tutoring")
@Tag(name = "Tutoring", description = "Tutoring related operations")
@RequiredArgsConstructor
public class TutoringController {

    private final TutoringService tutoringService;
    private final UserService userService;
    private final ModelMapper modelMapper;
    private final FeatureManager featureManager;

    @PostMapping("/create-tutoring")
    @Operation(summary = "Create tutoring post", description = "Creates a tutoring post for the authenticated user.")
    public ResponseEntity<TutoringResponseDTO> createTutoring(@Valid @RequestBody TutoringRequestDTO requestDTO) {
        if (!featureManager.isActive(CREATE_TUTORING)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        User user = userService.getAuthenticatedUser();
        if (!requestDTO.getUserId().equals(user.getId())) {
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
