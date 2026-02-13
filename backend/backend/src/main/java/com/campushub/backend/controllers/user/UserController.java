package com.campushub.backend.controllers.user;

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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.togglz.core.manager.FeatureManager;

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
}
