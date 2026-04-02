package com.campushub.backend.services.user;

import com.campushub.backend.enums.user.UserStatus;
import com.campushub.backend.exceptions.user.EmailAlreadyExistsException;
import com.campushub.backend.exceptions.user.UserNotFoundException;
import com.campushub.backend.models.user.User;
import com.campushub.backend.repositories.user.UserRepository;
import com.campushub.backend.services.authentication.EmailVerificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailVerificationService emailVerificationService;

    @InjectMocks
    private UserService userService;

    // -------------------------------------------------------------------------
    // createUser
    // -------------------------------------------------------------------------

    @Test
    void createUser_throwsEmailAlreadyExistsException_whenEmailTaken() {
        User user = new User();
        user.setEmail("taken@aub.edu");
        user.setPassword("plain");

        when(userRepository.existsByEmail("taken@aub.edu")).thenReturn(true);

        assertThrows(EmailAlreadyExistsException.class, () -> userService.createUser(user));
        verify(userRepository, never()).save(any());
    }

    @Test
    void createUser_setsStatusToPending() {
        User user = new User();
        user.setEmail("new@aub.edu");
        user.setPassword("plain");

        when(userRepository.existsByEmail("new@aub.edu")).thenReturn(false);
        when(passwordEncoder.encode("plain")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        doNothing().when(emailVerificationService).sendVerificationEmail(any(), anyString());

        User created = userService.createUser(user);

        assertEquals(UserStatus.PENDING, created.getStatus());
    }

    @Test
    void createUser_encodesPassword() {
        User user = new User();
        user.setEmail("new@aub.edu");
        user.setPassword("plain-password");

        when(userRepository.existsByEmail("new@aub.edu")).thenReturn(false);
        when(passwordEncoder.encode("plain-password")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        doNothing().when(emailVerificationService).sendVerificationEmail(any(), anyString());

        User created = userService.createUser(user);

        assertEquals("encoded-password", created.getPassword());
        verify(passwordEncoder).encode("plain-password");
    }

    @Test
    void createUser_initializesCartForUser() {
        User user = new User();
        user.setEmail("new@aub.edu");
        user.setPassword("pw");

        when(userRepository.existsByEmail("new@aub.edu")).thenReturn(false);
        when(passwordEncoder.encode("pw")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        doNothing().when(emailVerificationService).sendVerificationEmail(any(), anyString());

        User created = userService.createUser(user);

        assertNotNull(created.getCart());
        assertSame(created, created.getCart().getUser());
    }

    @Test
    void createUser_savesUserToRepository() {
        User user = new User();
        user.setEmail("new@aub.edu");
        user.setPassword("pw");

        when(userRepository.existsByEmail("new@aub.edu")).thenReturn(false);
        when(passwordEncoder.encode("pw")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        doNothing().when(emailVerificationService).sendVerificationEmail(any(), anyString());

        userService.createUser(user);

        verify(userRepository).save(any(User.class));
    }

    @Test
    void createUser_sendsVerificationEmail() {
        User user = new User();
        user.setEmail("new@aub.edu");
        user.setPassword("pw");

        when(userRepository.existsByEmail("new@aub.edu")).thenReturn(false);
        when(passwordEncoder.encode("pw")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        doNothing().when(emailVerificationService).sendVerificationEmail(any(), anyString());

        userService.createUser(user);

        verify(emailVerificationService).sendVerificationEmail(any(User.class), anyString());
    }

    // -------------------------------------------------------------------------
    // verifyEmail
    // -------------------------------------------------------------------------

    @Test
    void verifyEmail_throwsUserNotFoundException_whenEmailNotFound() {
        when(userRepository.findByEmail("ghost@aub.edu")).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class,
                () -> userService.verifyEmail("ghost@aub.edu", "123456"));
    }

    @Test
    void verifyEmail_throwsIllegalArgumentException_whenAlreadyActive() {
        User user = new User();
        user.setStatus(UserStatus.ACTIVE);

        when(userRepository.findByEmail("active@aub.edu")).thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class,
                () -> userService.verifyEmail("active@aub.edu", "123456"));
    }

    @Test
    void verifyEmail_throwsIllegalArgumentException_whenTokenInvalid() {
        User user = new User();
        user.setStatus(UserStatus.PENDING);
        user.setEmailVerificationToken("definitely-not-the-right-hash");
        user.setEmailVerificationExpiresAt(LocalDateTime.now().plusHours(1));

        when(userRepository.findByEmail("u@aub.edu")).thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class,
                () -> userService.verifyEmail("u@aub.edu", "wrong-token"));
    }

    @Test
    void verifyEmail_throwsIllegalArgumentException_whenTokenExpired() throws Exception {
        // Compute the correct hash so tokenMatches=true, but set an expired date
        String rawToken = "654321";
        String hashedToken = sha256Base64Url(rawToken);

        User user = new User();
        user.setStatus(UserStatus.PENDING);
        user.setEmailVerificationToken(hashedToken);
        user.setEmailVerificationExpiresAt(LocalDateTime.now().minusHours(2)); // already expired

        when(userRepository.findByEmail("u@aub.edu")).thenReturn(Optional.of(user));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> userService.verifyEmail("u@aub.edu", rawToken));
        assertEquals("Verification token has expired", ex.getMessage());
    }

    @Test
    void verifyEmail_setsStatusToActive_whenTokenValid() throws Exception {
        String rawToken = "112233";
        String hashedToken = sha256Base64Url(rawToken);

        User user = new User();
        user.setStatus(UserStatus.PENDING);
        user.setEmailVerificationToken(hashedToken);
        user.setEmailVerificationExpiresAt(LocalDateTime.now().plusHours(1));

        when(userRepository.findByEmail("u@aub.edu")).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        User verified = userService.verifyEmail("u@aub.edu", rawToken);

        assertEquals(UserStatus.ACTIVE, verified.getStatus());
    }

    @Test
    void verifyEmail_clearsVerificationToken_onSuccess() throws Exception {
        String rawToken = "445566";
        String hashedToken = sha256Base64Url(rawToken);

        User user = new User();
        user.setStatus(UserStatus.PENDING);
        user.setEmailVerificationToken(hashedToken);
        user.setEmailVerificationExpiresAt(LocalDateTime.now().plusHours(1));

        when(userRepository.findByEmail("u@aub.edu")).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        userService.verifyEmail("u@aub.edu", rawToken);

        assertNull(user.getEmailVerificationToken());
        assertNull(user.getEmailVerificationExpiresAt());
    }

    // -------------------------------------------------------------------------
    // findById / findByEmail / findByUsername
    // -------------------------------------------------------------------------

    @Test
    void findById_throwsUserNotFoundException_whenNotFound() {
        UUID id = UUID.randomUUID();
        when(userRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.findById(id));
    }

    @Test
    void findById_returnsUser_whenFound() {
        UUID id = UUID.randomUUID();
        User user = new User();
        user.setId(id);

        when(userRepository.findById(id)).thenReturn(Optional.of(user));

        User result = userService.findById(id);

        assertSame(user, result);
    }

    @Test
    void findByEmail_throwsUserNotFoundException_whenNotFound() {
        when(userRepository.findByEmail("nobody@aub.edu")).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class,
                () -> userService.findByEmail("nobody@aub.edu"));
    }

    @Test
    void findByUsername_throwsUserNotFoundException_whenNotFound() {
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class,
                () -> userService.findByUsername("ghost"));
    }

    // -------------------------------------------------------------------------
    // deleteUserById
    // -------------------------------------------------------------------------

    @Test
    void deleteUserById_throwsUserNotFoundException_whenNotFound() {
        UUID id = UUID.randomUUID();
        when(userRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.deleteUserById(id));
        verify(userRepository, never()).deleteById(any());
    }

    @Test
    void deleteUserById_deletesUser_whenFound() {
        UUID id = UUID.randomUUID();
        User user = new User();
        user.setId(id);

        when(userRepository.findById(id)).thenReturn(Optional.of(user));
        doNothing().when(userRepository).deleteById(id);

        User deleted = userService.deleteUserById(id);

        assertSame(user, deleted);
        verify(userRepository).deleteById(id);
    }

    // -------------------------------------------------------------------------
    // resetPassword
    // -------------------------------------------------------------------------

    @Test
    void resetPassword_throwsIllegalArgumentException_whenTokenInvalid() {
        User user = new User();
        user.setPasswordResetToken("not-the-right-hash");
        user.setPasswordResetExpiresAt(LocalDateTime.now().plusMinutes(10));

        when(userRepository.findByEmail("u@aub.edu")).thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class,
                () -> userService.resetPassword("u@aub.edu", "bad-token", "NewPass1!"));
    }

    @Test
    void resetPassword_throwsIllegalArgumentException_whenTokenExpired() throws Exception {
        String rawToken = "777888";
        String hashedToken = sha256Base64Url(rawToken);

        User user = new User();
        user.setPasswordResetToken(hashedToken);
        user.setPasswordResetExpiresAt(LocalDateTime.now().minusMinutes(30)); // expired

        when(userRepository.findByEmail("u@aub.edu")).thenReturn(Optional.of(user));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> userService.resetPassword("u@aub.edu", rawToken, "NewPass1!"));
        assertEquals("Password reset token has expired", ex.getMessage());
    }

    // -------------------------------------------------------------------------
    // Helper
    // -------------------------------------------------------------------------

    private static String sha256Base64Url(String raw) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
    }
}
