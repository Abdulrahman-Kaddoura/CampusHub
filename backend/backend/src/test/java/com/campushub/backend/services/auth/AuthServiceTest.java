package com.campushub.backend.services.auth;

import com.campushub.backend.dtos.auth.EmailVerificationConfirmDTO;
import com.campushub.backend.dtos.auth.EmailVerificationRequestDTO;
import com.campushub.backend.dtos.auth.EmailVerificationTokenResponseDTO;
import com.campushub.backend.dtos.auth.MessageResponseDTO;
import com.campushub.backend.dtos.auth.PasswordResetTokenResponseDTO;
import com.campushub.backend.dtos.auth.PasswordResetConfirmDTO;
import com.campushub.backend.dtos.auth.PasswordResetRequestDTO;
import com.campushub.backend.enums.user.UserStatus;
import com.campushub.backend.exceptions.auth.InvalidEmailVerificationTokenException;
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

        PasswordResetTokenResponseDTO response = authService.requestPasswordReset(request);

        assertEquals("Password reset token generated successfully.", response.message());
        assertNotNull(response.token());
        assertNotNull(response.expiresAt());
        assertNotNull(user.getResetToken());
        assertNotNull(user.getResetTokenExpiresAt());
        verify(userRepository).save(user);
    }

    @Test
    void requestPasswordResetDoesNotLeakUnknownEmail() {
        PasswordResetRequestDTO request = new PasswordResetRequestDTO();
        request.setEmail("missing@example.com");

        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        PasswordResetTokenResponseDTO response = authService.requestPasswordReset(request);

        assertEquals("No account found for that email.", response.message());
        assertNull(response.token());
        assertNull(response.expiresAt());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void resetPasswordUpdatesPasswordAndClearsToken() {
        PasswordResetConfirmDTO request = new PasswordResetConfirmDTO();
        request.setToken("  valid-token  ");
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


    @Test
    void requestEmailVerificationGeneratesTokenForPendingUser() {
        EmailVerificationRequestDTO request = new EmailVerificationRequestDTO();
        request.setEmail("pending@example.com");

        User user = new User();
        user.setEmail("pending@example.com");
        user.setStatus(UserStatus.PENDING);

        when(userRepository.findByEmail("pending@example.com")).thenReturn(Optional.of(user));

        EmailVerificationTokenResponseDTO response = authService.requestEmailVerification(request);

        assertEquals("Email verification token generated successfully.", response.message());
        assertNotNull(response.token());
        assertNotNull(response.expiresAt());
        verify(userRepository).save(user);
    }

    @Test
    void verifyEmailActivatesUserAndClearsVerificationToken() {
        EmailVerificationConfirmDTO request = new EmailVerificationConfirmDTO();
        request.setToken("verify-token");

        User user = new User();
        user.setStatus(UserStatus.PENDING);
        user.setVerificationToken("verify-token");
        user.setVerificationTokenExpiresAt(LocalDateTime.now().plusHours(2));

        when(userRepository.findByVerificationToken("verify-token")).thenReturn(Optional.of(user));

        MessageResponseDTO response = authService.verifyEmail(request);

        assertEquals("Email verified successfully.", response.message());
        assertEquals(UserStatus.ACTIVE, user.getStatus());
        assertNull(user.getVerificationToken());
        assertNull(user.getVerificationTokenExpiresAt());
        assertNotNull(user.getEmailVerifiedAt());
        verify(userRepository).save(user);
    }

    @Test
    void verifyEmailRejectsExpiredToken() {
        EmailVerificationConfirmDTO request = new EmailVerificationConfirmDTO();
        request.setToken("expired-verify-token");

        User user = new User();
        user.setVerificationToken("expired-verify-token");
        user.setVerificationTokenExpiresAt(LocalDateTime.now().minusMinutes(1));

        when(userRepository.findByVerificationToken("expired-verify-token")).thenReturn(Optional.of(user));

        assertThrows(InvalidEmailVerificationTokenException.class, () -> authService.verifyEmail(request));
    }

}
