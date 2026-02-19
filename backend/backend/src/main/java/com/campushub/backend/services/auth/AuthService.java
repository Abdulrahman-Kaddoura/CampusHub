package com.campushub.backend.services.auth;

import com.campushub.backend.dtos.auth.AuthResponseDTO;
import com.campushub.backend.dtos.auth.EmailVerificationConfirmDTO;
import com.campushub.backend.dtos.auth.EmailVerificationRequestDTO;
import com.campushub.backend.dtos.auth.EmailVerificationTokenResponseDTO;
import com.campushub.backend.dtos.auth.LoginRequestDTO;
import com.campushub.backend.dtos.auth.MessageResponseDTO;
import com.campushub.backend.dtos.auth.PasswordResetConfirmDTO;
import com.campushub.backend.dtos.auth.PasswordResetRequestDTO;
import com.campushub.backend.dtos.auth.PasswordResetTokenResponseDTO;
import com.campushub.backend.dtos.user.UserRequestDTO;
import com.campushub.backend.dtos.user.UserResponseDTO;
import com.campushub.backend.enums.user.UserStatus;
import com.campushub.backend.exceptions.auth.EmailNotVerifiedException;
import com.campushub.backend.exceptions.auth.InvalidEmailVerificationTokenException;
import com.campushub.backend.exceptions.auth.InvalidPasswordResetTokenException;
import com.campushub.backend.models.user.User;
import com.campushub.backend.repositories.user.UserRepository;
import com.campushub.backend.security.JwtService;
import com.campushub.backend.services.user.UserService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final ModelMapper modelMapper;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthResponseDTO register(UserRequestDTO userRequestDTO) {
        User createdUser = userService.registerUser(userRequestDTO);
        createdUser.setVerificationToken(UUID.randomUUID().toString());
        createdUser.setVerificationTokenExpiresAt(LocalDateTime.now().plusHours(24));
        userRepository.save(createdUser);

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
        if (user.getStatus() == UserStatus.PENDING) {
            throw new EmailNotVerifiedException("Please verify your email before logging in.");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtService.generateToken(userDetails);
        UserResponseDTO userResponseDTO = modelMapper.map(user, UserResponseDTO.class);
        return new AuthResponseDTO(token, userResponseDTO);
    }


    public PasswordResetTokenResponseDTO requestPasswordReset(PasswordResetRequestDTO requestDTO) {
        String normalizedEmail = requestDTO.getEmail().trim().toLowerCase();
        Optional<User> existingUser = userRepository.findByEmail(normalizedEmail);

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            String token = UUID.randomUUID().toString();
            LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(30);
            user.setResetToken(token);
            user.setResetTokenExpiresAt(expiresAt);
            userRepository.save(user);
            return new PasswordResetTokenResponseDTO("Password reset token generated successfully.", token, expiresAt);
        }

        return new PasswordResetTokenResponseDTO("No account found for that email.", null, null);
    }

    public MessageResponseDTO resetPassword(PasswordResetConfirmDTO requestDTO) {
        String token = requestDTO.getToken().trim();

        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new InvalidPasswordResetTokenException("Invalid or expired password reset token."));

        if (user.getResetTokenExpiresAt() == null || user.getResetTokenExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidPasswordResetTokenException("Invalid or expired password reset token.");
        }

        user.setPassword(passwordEncoder.encode(requestDTO.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiresAt(null);
        userRepository.save(user);

        return new MessageResponseDTO("Password has been reset successfully.");
    }



    public EmailVerificationTokenResponseDTO requestEmailVerification(EmailVerificationRequestDTO requestDTO) {
        String normalizedEmail = requestDTO.getEmail().trim().toLowerCase();
        Optional<User> existingUser = userRepository.findByEmail(normalizedEmail);

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            if (user.getStatus() == UserStatus.ACTIVE) {
                return new EmailVerificationTokenResponseDTO("Email is already verified.", null, null);
            }

            String token = UUID.randomUUID().toString();
            LocalDateTime expiresAt = LocalDateTime.now().plusHours(24);
            user.setVerificationToken(token);
            user.setVerificationTokenExpiresAt(expiresAt);
            userRepository.save(user);
            return new EmailVerificationTokenResponseDTO("Email verification token generated successfully.", token, expiresAt);
        }

        return new EmailVerificationTokenResponseDTO("No account found for that email.", null, null);
    }

    public MessageResponseDTO verifyEmail(EmailVerificationConfirmDTO requestDTO) {
        String token = requestDTO.getToken().trim();
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new InvalidEmailVerificationTokenException("Invalid or expired email verification token."));

        if (user.getVerificationTokenExpiresAt() == null || user.getVerificationTokenExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidEmailVerificationTokenException("Invalid or expired email verification token.");
        }

        user.setStatus(UserStatus.ACTIVE);
        user.setEmailVerifiedAt(LocalDateTime.now());
        user.setVerificationToken(null);
        user.setVerificationTokenExpiresAt(null);
        userRepository.save(user);

        return new MessageResponseDTO("Email verified successfully.");
    }

}
