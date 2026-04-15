package com.campushub.backend.controllers.user;

import com.campushub.backend.dtos.user.UpdateUserRequestDTO;
import com.campushub.backend.dtos.user.UserRequestDTO;
import com.campushub.backend.dtos.user.UserResponseDTO;
import com.campushub.backend.models.user.User;
import com.campushub.backend.services.user.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.togglz.core.manager.FeatureManager;

import java.io.IOException;
import java.util.UUID;

import static com.campushub.backend.configurations.togglz.Features.*;

@RestController
@RequestMapping("/user")
@Tag(name = "User", description = "User related operations")
public class UserController {

    @Autowired
    UserService userService;

    @Autowired
    ModelMapper modelMapper;

    @Autowired
    FeatureManager featureManager;

    @PostMapping("/create-user")
    @Operation(summary = "Create User", description = "Creates a new user with pending status and returns the created user details.")
    public ResponseEntity<UserResponseDTO> createUser(@Valid @RequestBody UserRequestDTO userRequestDTO) throws Exception{
        if (!featureManager.isActive(CREATE_USER)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        User user = modelMapper.map(userRequestDTO, User.class);
        User createdUser = userService.createUser(user);
        UserResponseDTO userResponseDTO = modelMapper.map(createdUser, UserResponseDTO.class);
        return new ResponseEntity<>(userResponseDTO, HttpStatus.CREATED);
    }

    @DeleteMapping("/delete-user/{userId}")
    @Operation(summary = "Delete User", description = "Deletes a user by their ID and returns the deleted user details.")
    public ResponseEntity<UserResponseDTO> deleteUser(@PathVariable UUID userId) {
        if (!featureManager.isActive(DELETE_USER)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        userService.requireAuthenticatedUser(userId);
        User user = userService.deleteUserById(userId);
        UserResponseDTO userResponseDTO = modelMapper.map(user, UserResponseDTO.class);
        return new ResponseEntity<>(userResponseDTO, HttpStatus.OK);
    }

    @GetMapping("/get-user-by-id/{userId}")
    @Operation(summary = "Get User by ID", description = "Retrieves a user by their unique ID and returns the user details.")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable UUID userId) {
        if (!featureManager.isActive(GET_USER_BY_ID)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        userService.requireAuthenticatedUser(userId);
        User user = userService.findById(userId);
        UserResponseDTO userResponseDTO = modelMapper.map(user, UserResponseDTO.class);
        return new ResponseEntity<>(userResponseDTO, HttpStatus.OK);
    }

    @GetMapping("/get-user-by-username/{username}")
    @Operation(summary = "Get User by Username", description = "Retrieves a user by their username and returns the user details.")
    public ResponseEntity<UserResponseDTO> getUserByUsername(@PathVariable String username) {
        if (!featureManager.isActive(GET_USER_BY_USERNAME)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        User actingUser = userService.getAuthenticatedUser();
        if (!actingUser.getUsername().equals(username)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        User user = userService.findByUsername(username);
        UserResponseDTO userResponseDTO = modelMapper.map(user, UserResponseDTO.class);
        return new ResponseEntity<>(userResponseDTO, HttpStatus.OK);
    }

    @GetMapping("/get-user-by-email/{email}")
    @Operation(summary = "Get User by Email", description = "Retrieves a user by their email address and returns the user details.")
    public ResponseEntity<UserResponseDTO> getUserByEmail(@PathVariable String email) {
        if (!featureManager.isActive(GET_USER_BY_EMAIL)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        User actingUser = userService.getAuthenticatedUser();
        if (!actingUser.getEmail().equals(email)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        User user = userService.findByEmail(email);
        UserResponseDTO userResponseDTO = modelMapper.map(user, UserResponseDTO.class);
        return new ResponseEntity<>(userResponseDTO, HttpStatus.OK);
    }

    @PostMapping("/profile-picture/upload")
    @Operation(summary = "Upload Profile Picture", description = "Uploads a profile picture for the authenticated user.")
    public ResponseEntity<Void> uploadProfilePicture(@RequestParam("file") MultipartFile file) {
        if (!featureManager.isActive(UPLOAD_PROFILE_PICTURE)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        try {
            userService.uploadProfilePicture(file);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/profile-picture/{userId}")
    @Operation(summary = "Get Profile Picture", description = "Returns the profile picture for a given user ID.")
    public ResponseEntity<byte[]> getProfilePicture(@PathVariable UUID userId) {
        if (!featureManager.isActive(GET_PROFILE_PICTURE)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        User user = userService.findById(userId);
        if (user.getProfilePicture() == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(user.getProfilePictureContentType()))
                .body(user.getProfilePicture());
    }

    @PutMapping("/update-profile")
    @Operation(summary = "Update Profile", description = "Updates the authenticated user's first name, last name, and phone number.")
    public ResponseEntity<UserResponseDTO> updateProfile(@Valid @RequestBody UpdateUserRequestDTO dto) {
        if (!featureManager.isActive(UPDATE_PROFILE)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        User updatedUser = userService.updateProfile(dto.getFirstName(), dto.getLastName(), dto.getPhoneNumber());
        UserResponseDTO userResponseDTO = modelMapper.map(updatedUser, UserResponseDTO.class);
        return new ResponseEntity<>(userResponseDTO, HttpStatus.OK);
    }

    @DeleteMapping("/profile-picture")
    @Operation(summary = "Delete Profile Picture", description = "Removes the profile picture of the authenticated user.")
    public ResponseEntity<Void> deleteProfilePicture() {
        if (!featureManager.isActive(UPLOAD_PROFILE_PICTURE)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        userService.deleteProfilePicture();
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
