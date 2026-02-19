package com.campushub.backend.services.auth;

import com.campushub.backend.dtos.auth.EmailVerificationConfirmDTO;
import com.campushub.backend.dtos.auth.EmailVerificationRequestDTO;
import com.campushub.backend.dtos.auth.EmailVerificationTokenResponseDTO;
import com.campushub.backend.dtos.auth.MessageResponseDTO;
import com.campushub.backend.dtos.auth.PasswordResetConfirmDTO;
import com.campushub.backend.dtos.auth.PasswordResetRequestDTO;
import com.campushub.backend.dtos.auth.PasswordResetTokenResponseDTO;
import com.campushub.backend.enums.user.UserStatus;
import com.campushub.backend.models.user.User;
import com.campushub.backend.repositories.user.UserRepository;
import com.campushub.backend.security.JwtService;
import com.campushub.backend.services.user.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.modelmapper.ModelMapper;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserService userService;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private UserDetailsService userDetailsService;
    @Mock
    private ModelMapper modelMapper;
    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    @Test
    void requestEmailVerificationReturnsTokenForPendingUser() {
        EmailVerificationRequestDTO request = new EmailVerificationRequestDTO();
        request.setEmail("pending@example.com");

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setStatus(UserStatus.PENDING);

        when(userRepository.findByEmail("pending@example.com")).thenReturn(Optional.of(user));

        EmailVerificationTokenResponseDTO response = authService.requestEmailVerification(request);

        assertEquals("Email verification token generated successfully.", response.message());
        assertNotNull(response.token());
        assertNotNull(response.expiresAt());
    }

    @Test
    void verifyEmailActivatesPendingUser() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setStatus(UserStatus.PENDING);

        EmailVerificationRequestDTO request = new EmailVerificationRequestDTO();
        request.setEmail("pending@example.com");

        when(userRepository.findByEmail("pending@example.com")).thenReturn(Optional.of(user));
        EmailVerificationTokenResponseDTO tokenResponse = authService.requestEmailVerification(request);

        EmailVerificationConfirmDTO confirmDTO = new EmailVerificationConfirmDTO();
        confirmDTO.setToken(tokenResponse.token());

        when(userService.findById(user.getId())).thenReturn(user);
        MessageResponseDTO response = authService.verifyEmail(confirmDTO);

        assertEquals("Email verified successfully.", response.message());
        assertEquals(UserStatus.ACTIVE, user.getStatus());
        verify(userRepository).save(user);
    }

    @Test
    void requestPasswordResetReturnsTokenForKnownEmail() {
        PasswordResetRequestDTO request = new PasswordResetRequestDTO();
        request.setEmail("test@example.com");

        User user = new User();
        user.setId(UUID.randomUUID());

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        PasswordResetTokenResponseDTO response = authService.requestPasswordReset(request);

        assertEquals("Password reset token generated successfully.", response.message());
        assertNotNull(response.token());
        assertNotNull(response.expiresAt());
    }

    @Test
    void resetPasswordUpdatesPassword() {
        User user = new User();
        user.setId(UUID.randomUUID());

        PasswordResetRequestDTO request = new PasswordResetRequestDTO();
        request.setEmail("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        PasswordResetTokenResponseDTO tokenResponse = authService.requestPasswordReset(request);

        PasswordResetConfirmDTO confirmDTO = new PasswordResetConfirmDTO();
        confirmDTO.setToken(tokenResponse.token());
        confirmDTO.setNewPassword("newSecurePassword");

        when(userService.findById(user.getId())).thenReturn(user);
        when(passwordEncoder.encode("newSecurePassword")).thenReturn("$2a$10$hashedPassword");

        MessageResponseDTO response = authService.resetPassword(confirmDTO);

        assertEquals("Password has been reset successfully.", response.message());
        assertEquals("$2a$10$hashedPassword", user.getPassword());
    }

    @Test
    void resetPasswordRejectsInvalidToken() {
        PasswordResetConfirmDTO request = new PasswordResetConfirmDTO();
        request.setToken("invalid-token");
        request.setNewPassword("newSecurePassword");

        assertThrows(RuntimeException.class, () -> authService.resetPassword(request));
    }
}
