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
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

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

    private final Map<String, TokenData> emailVerificationTokens = new ConcurrentHashMap<>();
    private final Map<UUID, String> emailVerificationTokenByUserId = new ConcurrentHashMap<>();
    private final Map<String, TokenData> passwordResetTokens = new ConcurrentHashMap<>();
    private final Map<UUID, String> passwordResetTokenByUserId = new ConcurrentHashMap<>();

    public AuthResponseDTO register(UserRequestDTO userRequestDTO) {
        User createdUser = userService.registerUser(userRequestDTO);
        createTokenForUser(createdUser.getId(), emailVerificationTokens, emailVerificationTokenByUserId, 24);

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
            throw new RuntimeException("Please verify your email before logging in.");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtService.generateToken(userDetails);
        UserResponseDTO userResponseDTO = modelMapper.map(user, UserResponseDTO.class);
        return new AuthResponseDTO(token, userResponseDTO);
    }

    public EmailVerificationTokenResponseDTO requestEmailVerification(EmailVerificationRequestDTO requestDTO) {
        String normalizedEmail = requestDTO.getEmail().trim().toLowerCase();
        Optional<User> existingUser = userRepository.findByEmail(normalizedEmail);

        if (existingUser.isEmpty()) {
            return new EmailVerificationTokenResponseDTO("No account found for that email.", null, null);
        }

        User user = existingUser.get();
        if (user.getStatus() == UserStatus.ACTIVE) {
            return new EmailVerificationTokenResponseDTO("Email is already verified.", null, null);
        }

        TokenData tokenData = createTokenForUser(user.getId(), emailVerificationTokens, emailVerificationTokenByUserId, 24);
        return new EmailVerificationTokenResponseDTO("Email verification token generated successfully.", tokenData.token(), tokenData.expiresAt());
    }

    public MessageResponseDTO verifyEmail(EmailVerificationConfirmDTO requestDTO) {
        String token = requestDTO.getToken().trim();
        TokenData tokenData = emailVerificationTokens.get(token);

        if (tokenData == null || tokenData.expiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Invalid or expired email verification token.");
        }

        User user = userService.findById(tokenData.userId());
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        emailVerificationTokens.remove(token);
        emailVerificationTokenByUserId.remove(user.getId());

        return new MessageResponseDTO("Email verified successfully.");
    }

    public PasswordResetTokenResponseDTO requestPasswordReset(PasswordResetRequestDTO requestDTO) {
        String normalizedEmail = requestDTO.getEmail().trim().toLowerCase();
        Optional<User> existingUser = userRepository.findByEmail(normalizedEmail);

        if (existingUser.isEmpty()) {
            return new PasswordResetTokenResponseDTO("No account found for that email.", null, null);
        }

        TokenData tokenData = createTokenForUser(existingUser.get().getId(), passwordResetTokens, passwordResetTokenByUserId, 1);
        return new PasswordResetTokenResponseDTO("Password reset token generated successfully.", tokenData.token(), tokenData.expiresAt());
    }

    public MessageResponseDTO resetPassword(PasswordResetConfirmDTO requestDTO) {
        String token = requestDTO.getToken().trim();
        TokenData tokenData = passwordResetTokens.get(token);

        if (tokenData == null || tokenData.expiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Invalid or expired password reset token.");
        }

        User user = userService.findById(tokenData.userId());
        user.setPassword(passwordEncoder.encode(requestDTO.getNewPassword()));
        userRepository.save(user);

        passwordResetTokens.remove(token);
        passwordResetTokenByUserId.remove(user.getId());

        return new MessageResponseDTO("Password has been reset successfully.");
    }

    private TokenData createTokenForUser(UUID userId, Map<String, TokenData> tokenStore, Map<UUID, String> indexStore, int validHours) {
        String oldToken = indexStore.get(userId);
        if (oldToken != null) {
            tokenStore.remove(oldToken);
        }

        String token = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(validHours);
        TokenData tokenData = new TokenData(token, userId, expiresAt);

        tokenStore.put(token, tokenData);
        indexStore.put(userId, token);

        return tokenData;
    }

    private record TokenData(String token, UUID userId, LocalDateTime expiresAt) {
    }
}
