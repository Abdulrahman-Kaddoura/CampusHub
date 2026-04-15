package com.campushub.backend.controllers.authentication;

import com.campushub.backend.dtos.authentication.AuthRequestDTO;
import com.campushub.backend.dtos.authentication.AuthResponseDTO;
import com.campushub.backend.dtos.authentication.VerifyEmailRequestDTO;
import com.campushub.backend.dtos.user.UserRequestDTO;
import com.campushub.backend.dtos.user.UserResponseDTO;
import com.campushub.backend.models.user.User;
import com.campushub.backend.services.listings.HuggingFaceContentModerationService;
import com.campushub.backend.services.user.AppUserDetailsService;
import com.campushub.backend.services.user.UserService;
import com.campushub.backend.util.JwtUtil;
import jakarta.validation.Valid;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.togglz.core.manager.FeatureManager;

import java.util.HashMap;
import java.util.Map;

import static com.campushub.backend.configurations.togglz.Features.*;

@RestController
@RequestMapping({"/auth", "/api/auth"})
public class AuthController {

    @Autowired
    FeatureManager featureManager;

    @Autowired
    ModelMapper modelMapper;

    @Autowired
    UserService userService;

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    AppUserDetailsService appUserDetailsService;

    @Autowired
    JwtUtil jwtUtil;

    @Autowired
    HuggingFaceContentModerationService contentModerationService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequestDTO authRequestDTO) {
        if (!featureManager.isActive(LOGIN)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequestDTO.getEmail(), authRequestDTO.getPassword()));
            final UserDetails userDetails = appUserDetailsService.loadUserByUsername(authRequestDTO.getEmail());
            final String jwtToken = jwtUtil.generateToken(userDetails);
            return ResponseEntity.ok(new AuthResponseDTO(authRequestDTO.getEmail(), jwtToken));
        } catch (BadCredentialsException ex) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", "Email or password is incorrect");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (DisabledException ex) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", "Verify email before logging in");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        } catch (Exception ex) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", "Authentication failed");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getCurrentUser() {
        User user = userService.getAuthenticatedUser();
        UserResponseDTO userResponseDTO = modelMapper.map(user, UserResponseDTO.class);
        return ResponseEntity.ok(userResponseDTO);
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody UserRequestDTO userRequestDTO) {
        if (!featureManager.isActive(REGISTER)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        String textToScreen = userRequestDTO.getUsername() + " "
                + userRequestDTO.getFirstName() + " "
                + userRequestDTO.getLastName();
        if (!contentModerationService.isAppropriate(textToScreen)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Registration rejected: your profile contains inappropriate language.");
        }
        User user = modelMapper.map(userRequestDTO, User.class);
        User createdUser = userService.createUser(user);
        UserResponseDTO userResponseDTO = modelMapper.map(createdUser, UserResponseDTO.class);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Registration successful. Please verify your email to activate your account.");
        response.put("user", userResponseDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, Object>> verifyEmail(@Valid @RequestBody VerifyEmailRequestDTO verifyEmailRequestDTO) {
        return handleVerifyEmail(verifyEmailRequestDTO.getEmail(), verifyEmailRequestDTO.getToken());
    }

    @GetMapping("/verify-email")
    public ResponseEntity<Map<String, Object>> verifyEmailFromLink(@RequestParam String email, @RequestParam String token) {
        return handleVerifyEmail(email, token);
    }

    private ResponseEntity<Map<String, Object>> handleVerifyEmail(String email, String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            User verifiedUser = userService.verifyEmail(email, token);
            response.put("message", "Email verified successfully");
            response.put("user", modelMapper.map(verifiedUser, UserResponseDTO.class));
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            response.put("error", true);
            response.put("message", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception ex) {
            response.put("error", true);
            response.put("message", "Email verification failed");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}
