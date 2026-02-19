package com.campushub.backend.services.auth;

import com.campushub.backend.dtos.auth.MessageResponseDTO;
import com.campushub.backend.dtos.auth.PasswordResetConfirmDTO;
import com.campushub.backend.dtos.auth.PasswordResetRequestDTO;
import com.campushub.backend.exceptions.auth.InvalidPasswordResetTokenException;
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

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
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
    void requestPasswordResetGeneratesTokenForKnownEmail() {
        PasswordResetRequestDTO request = new PasswordResetRequestDTO();
        request.setEmail("test@example.com");

        User user = new User();
        user.setEmail("test@example.com");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        MessageResponseDTO response = authService.requestPasswordReset(request);

        assertEquals("If an account with that email exists, a password reset token has been generated.", response.message());
        assertNotNull(user.getResetToken());
        assertNotNull(user.getResetTokenExpiresAt());
        verify(userRepository).save(user);
    }

    @Test
    void requestPasswordResetDoesNotLeakUnknownEmail() {
        PasswordResetRequestDTO request = new PasswordResetRequestDTO();
        request.setEmail("missing@example.com");

        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        MessageResponseDTO response = authService.requestPasswordReset(request);

        assertEquals("If an account with that email exists, a password reset token has been generated.", response.message());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void resetPasswordUpdatesPasswordAndClearsToken() {
        PasswordResetConfirmDTO request = new PasswordResetConfirmDTO();
        request.setToken("valid-token");
        request.setNewPassword("newSecurePassword");

        User user = new User();
        user.setResetToken("valid-token");
        user.setResetTokenExpiresAt(LocalDateTime.now().plusMinutes(5));

        when(userRepository.findByResetToken("valid-token")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("newSecurePassword")).thenReturn("$2a$10$hashedPassword");

        MessageResponseDTO response = authService.resetPassword(request);

        assertEquals("Password has been reset successfully.", response.message());
        assertEquals("$2a$10$hashedPassword", user.getPassword());
        assertNull(user.getResetToken());
        assertNull(user.getResetTokenExpiresAt());
        verify(userRepository).save(user);
    }

    @Test
    void resetPasswordRejectsExpiredToken() {
        PasswordResetConfirmDTO request = new PasswordResetConfirmDTO();
        request.setToken("expired-token");
        request.setNewPassword("newSecurePassword");

        User user = new User();
        user.setResetToken("expired-token");
        user.setResetTokenExpiresAt(LocalDateTime.now().minusMinutes(1));

        when(userRepository.findByResetToken("expired-token")).thenReturn(Optional.of(user));

        assertThrows(InvalidPasswordResetTokenException.class, () -> authService.resetPassword(request));
    }
}
