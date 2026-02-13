package com.campushub.backend.controllers.authentication;

import com.campushub.backend.dtos.authentication.AuthRequestDTO;
import com.campushub.backend.dtos.authentication.AuthResponseDTO;
import com.campushub.backend.dtos.user.UserRequestDTO;
import com.campushub.backend.dtos.user.UserResponseDTO;
import com.campushub.backend.models.user.User;
import com.campushub.backend.services.user.AppUserDetailsService;
import com.campushub.backend.services.user.UserService;
import com.campushub.backend.util.JwtUtil;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.togglz.core.manager.FeatureManager;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import static com.campushub.backend.configurations.togglz.Features.*;

@RestController
@RequestMapping("/auth")
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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequestDTO authRequestDTO) {
        if (!featureManager.isActive(LOGIN)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        try {
            authenticate(authRequestDTO.getEmail(), authRequestDTO.getPassword());
            final UserDetails userDetails = appUserDetailsService.loadUserByUsername(authRequestDTO.getEmail());
            final String jwtToken = jwtUtil.generateToken(userDetails);
            ResponseCookie cookie  = ResponseCookie.from("jwt", jwtToken)
                    .httpOnly(true)
                    .path("/")
                    .maxAge(Duration.ofDays(1))
                    .sameSite("Strict")
                    .build();
            return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(new AuthResponseDTO(authRequestDTO.getEmail(), jwtToken));
        } catch (BadCredentialsException ex) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", "Email or password is incorrect");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (DisabledException ex) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", "Account is disabled");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        } catch (Exception ex) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", "Authentication failed");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(@RequestBody UserRequestDTO userRequestDTO) {
        if (!featureManager.isActive(REGISTER)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        User user = modelMapper.map(userRequestDTO, User.class);
        User createdUser = userService.createUser(user);
        UserResponseDTO userResponseDTO = modelMapper.map(createdUser, UserResponseDTO.class);
        return new ResponseEntity<>(userResponseDTO, HttpStatus.CREATED);
    }

    private void authenticate(String email, String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
    }
}
