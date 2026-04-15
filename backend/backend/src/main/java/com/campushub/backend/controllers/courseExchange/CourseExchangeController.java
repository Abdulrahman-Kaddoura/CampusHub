package com.campushub.backend.controllers.courseExchange;

import com.campushub.backend.dtos.courseExchange.CourseExchangeRequestDTO;
import com.campushub.backend.dtos.courseExchange.CourseExchangeResponseDTO;
import com.campushub.backend.models.courseExchange.CourseExchange;
import com.campushub.backend.models.user.User;
import com.campushub.backend.services.courseExchange.CourseExchangeService;
import com.campushub.backend.services.listings.HuggingFaceContentModerationService;
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
@RequestMapping("/course-exchange")
@Tag(name = "Course Exchange", description = "Course exchange related operations")
@RequiredArgsConstructor
public class CourseExchangeController {

    private final CourseExchangeService courseExchangeService;
    private final UserService userService;
    private final ModelMapper modelMapper;
    private final FeatureManager featureManager;
    private final HuggingFaceContentModerationService contentModerationService;

    @PostMapping("/create-course-exchange")
    @Operation(summary = "Create course exchange post", description = "Creates a course exchange post for the authenticated user.")
    public ResponseEntity<CourseExchangeResponseDTO> createCourseExchange(@Valid @RequestBody CourseExchangeRequestDTO requestDTO) {
        if (!featureManager.isActive(CREATE_COURSE_EXCHANGE)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        String textToScreen = requestDTO.getCurrentCourse() + " " + requestDTO.getDesiredCourse() + " "
                + (requestDTO.getNotes() != null ? requestDTO.getNotes() : "");
        if (!contentModerationService.isAppropriate(textToScreen)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Course exchange post contains inappropriate content.");
        }

        User user = userService.getAuthenticatedUser();
        if (!requestDTO.getUserId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only create course exchange posts for your own account");
        }

        CourseExchange courseExchange = modelMapper.map(requestDTO, CourseExchange.class);
        courseExchange.setUser(user);

        CourseExchange createdCourseExchange = courseExchangeService.createCourseExchange(courseExchange);
        CourseExchangeResponseDTO responseDTO = modelMapper.map(createdCourseExchange, CourseExchangeResponseDTO.class);
        responseDTO.setCourseExchangeId(createdCourseExchange.getCourseExchangeId());
        responseDTO.setUserId(createdCourseExchange.getUser().getId());

        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    @GetMapping("/get-course-exchanges")
    @Operation(summary = "Get all course exchange posts", description = "Retrieves all course exchange posts.")
    public ResponseEntity<List<CourseExchangeResponseDTO>> getAllCourseExchanges() {
        if (!featureManager.isActive(GET_ALL_COURSE_EXCHANGES)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        List<CourseExchangeResponseDTO> response = courseExchangeService.getAllCourseExchanges().stream()
                .map(courseExchange -> {
                    CourseExchangeResponseDTO dto = modelMapper.map(courseExchange, CourseExchangeResponseDTO.class);
                    dto.setCourseExchangeId(courseExchange.getCourseExchangeId());
                    dto.setUserId(courseExchange.getUser().getId());
                    return dto;
                })
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/get-course-exchanges-by-user/{userId}")
    @Operation(summary = "Get course exchange posts by user", description = "Retrieves course exchange posts for a specific user.")
    public ResponseEntity<List<CourseExchangeResponseDTO>> getAllCourseExchangesByUser(@PathVariable UUID userId) {
        if (!featureManager.isActive(GET_ALL_COURSE_EXCHANGES_BY_USER)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        userService.requireAuthenticatedUser(userId);

        List<CourseExchangeResponseDTO> response = courseExchangeService.getAllCourseExchangesByUser(userId).stream()
                .map(courseExchange -> {
                    CourseExchangeResponseDTO dto = modelMapper.map(courseExchange, CourseExchangeResponseDTO.class);
                    dto.setCourseExchangeId(courseExchange.getCourseExchangeId());
                    dto.setUserId(courseExchange.getUser().getId());
                    return dto;
                })
                .toList();

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete-course-exchange/{courseExchangeId}")
    @Operation(summary = "Delete course exchange post", description = "Deletes a course exchange post owned by the authenticated user.")
    public ResponseEntity<CourseExchangeResponseDTO> deleteCourseExchange(@PathVariable UUID courseExchangeId) {
        if (!featureManager.isActive(DELETE_COURSE_EXCHANGE)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        User actingUser = userService.getAuthenticatedUser();
        CourseExchange deletedCourseExchange = courseExchangeService.deleteCourseExchangeByIdForUser(courseExchangeId, actingUser.getId());

        CourseExchangeResponseDTO responseDTO = modelMapper.map(deletedCourseExchange, CourseExchangeResponseDTO.class);
        responseDTO.setCourseExchangeId(deletedCourseExchange.getCourseExchangeId());
        responseDTO.setUserId(deletedCourseExchange.getUser().getId());

        return ResponseEntity.ok(responseDTO);
    }
}
