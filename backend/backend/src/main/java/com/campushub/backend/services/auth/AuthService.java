package com.campushub.backend.services.auth;

import com.campushub.backend.dtos.auth.AuthResponseDTO;
import com.campushub.backend.dtos.auth.LoginRequestDTO;
import com.campushub.backend.dtos.user.UserRequestDTO;
import com.campushub.backend.dtos.user.UserResponseDTO;
import com.campushub.backend.models.user.User;
import com.campushub.backend.security.JwtService;
import com.campushub.backend.services.user.UserService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final ModelMapper modelMapper;

    public AuthResponseDTO register(UserRequestDTO userRequestDTO) {
        User createdUser = userService.registerUser(userRequestDTO);
        UserDetails userDetails = userDetailsService.loadUserByUsername(createdUser.getUsername());
        String token = jwtService.generateToken(userDetails);
        UserResponseDTO userResponseDTO = modelMapper.map(createdUser, UserResponseDTO.class);
        return new AuthResponseDTO(token, userResponseDTO);
    }

    public AuthResponseDTO login(LoginRequestDTO loginRequestDTO) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequestDTO.getUsername(), loginRequestDTO.getPassword())
        );

        User user = userService.findByUsername(loginRequestDTO.getUsername());
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtService.generateToken(userDetails);
        UserResponseDTO userResponseDTO = modelMapper.map(user, UserResponseDTO.class);
        return new AuthResponseDTO(token, userResponseDTO);
    }
}
