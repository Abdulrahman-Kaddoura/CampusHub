package com.campushub.backend.controllers.auth;

import com.campushub.backend.dtos.auth.AuthResponseDTO;
import com.campushub.backend.dtos.auth.LoginRequestDTO;
import com.campushub.backend.dtos.user.UserRequestDTO;
import com.campushub.backend.dtos.user.UserResponseDTO;
import com.campushub.backend.models.user.User;
import com.campushub.backend.services.auth.AuthService;
import com.campushub.backend.services.user.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Authentication operations")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final ModelMapper modelMapper;

    @PostMapping("/register")
    @Operation(summary = "Register", description = "Create a new account and receive a JWT token")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody UserRequestDTO requestDTO) {
        return new ResponseEntity<>(authService.register(requestDTO), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticate and receive a JWT token")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO requestDTO) {
        return ResponseEntity.ok(authService.login(requestDTO));
    }

    @GetMapping("/me")
    @Operation(summary = "Current user", description = "Returns the currently authenticated user")
    public ResponseEntity<UserResponseDTO> me(Authentication authentication) {
        User user = userService.findByUsername(authentication.getName());
        return ResponseEntity.ok(modelMapper.map(user, UserResponseDTO.class));
    }
}
