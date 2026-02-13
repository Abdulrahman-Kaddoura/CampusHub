package com.campushub.backend.services.user;

import com.campushub.backend.enums.user.UserStatus;
import com.campushub.backend.exceptions.user.EmailAlreadyExistsException;
import com.campushub.backend.exceptions.user.UserNotFoundException;
import com.campushub.backend.models.cart.Cart;
import com.campushub.backend.models.user.User;
import com.campushub.backend.repositories.user.UserRepository;
import com.campushub.backend.services.authentication.EmailVerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

@Service
public class UserService {
    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    EmailVerificationService emailVerificationService;

    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new EmailAlreadyExistsException("Email already exists");
        }
        user.setStatus(UserStatus.PENDING);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setEmailVerificationToken(UUID.randomUUID().toString());
        String rawVerificationToken = rotateEmailVerificationToken(user);

        Cart cart = new Cart();
        cart.setUser(user);
        user.setCart(cart);
        User createdUser = userRepository.save(user);
        emailVerificationService.sendVerificationEmail(createdUser, rawVerificationToken);
        return createdUser;
    }

    @Transactional
    public User verifyEmail(String email, String token) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));

        if (user.getStatus() == UserStatus.ACTIVE) {
            throw new IllegalArgumentException("Email is already verified");
        }

        boolean tokenMatches = isTokenMatch(token, user.getEmailVerificationToken());
        boolean tokenNotExpired = user.getEmailVerificationExpiresAt() != null
                && user.getEmailVerificationExpiresAt().isAfter(LocalDateTime.now());

        if (!tokenMatches) {
            throw new IllegalArgumentException("Verification token is invalid");
        }

        if (!tokenNotExpired) {
            throw new IllegalArgumentException("Verification token has expired");
        }
        user.setStatus(UserStatus.ACTIVE);
        user.setEmailVerifiedAt(LocalDateTime.now());
        user.setEmailVerificationToken(null);
        user.setEmailVerificationExpiresAt(null);
        return userRepository.save(user);
    }

    @Transactional
    public void resendEmailVerification(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));

        if (user.getStatus() == UserStatus.ACTIVE) {
            throw new IllegalArgumentException("Email is already verified");
        }

        String rawVerificationToken = rotateEmailVerificationToken(user);
        User updatedUser = userRepository.save(user);
        emailVerificationService.sendVerificationEmail(updatedUser, rawVerificationToken);
    }

    private String rotateEmailVerificationToken(User user) {
        String rawVerificationToken = UUID.randomUUID().toString();
        user.setEmailVerificationToken(hashVerificationToken(rawVerificationToken));
        user.setEmailVerificationExpiresAt(LocalDateTime.now().plusHours(1));
        return rawVerificationToken;
    }

    private boolean isTokenMatch(String rawToken, String storedHashedToken) {
        if (rawToken == null || storedHashedToken == null) {
            return false;
        }

        byte[] providedTokenHash = hashVerificationToken(rawToken).getBytes(StandardCharsets.UTF_8);
        byte[] storedTokenHash = storedHashedToken.getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(providedTokenHash, storedTokenHash);
    }

    private String hashVerificationToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 algorithm unavailable", ex);
        }
    }

    public User findById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
//                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found with username: " + username));
//                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
//                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    @Transactional
    public User deleteUserById(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
//                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        userRepository.deleteById(userId);

        return user;
    }
}
