package com.campushub.backend.services.user;

import com.campushub.backend.enums.user.UserStatus;
import com.campushub.backend.exceptions.user.EmailAlreadyExistsException;
import com.campushub.backend.exceptions.user.UserNotFoundException;
import com.campushub.backend.models.cart.Cart;
import com.campushub.backend.models.user.User;
import com.campushub.backend.repositories.user.UserRepository;
import com.campushub.backend.services.authentication.EmailVerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

@Service
public class UserService {

    private static final int VERIFICATION_CODE_LENGTH = 6;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

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

    private String rotateEmailVerificationToken(User user) {
        String rawVerificationToken = generateVerificationCode();
        user.setEmailVerificationToken(hashVerificationToken(rawVerificationToken));
        user.setEmailVerificationExpiresAt(LocalDateTime.now().plusHours(1));
        return rawVerificationToken;
    }

    private String generateVerificationCode() {
        int max = (int) Math.pow(10, VERIFICATION_CODE_LENGTH);
        int code = SECURE_RANDOM.nextInt(max);
        return String.format("%0" + VERIFICATION_CODE_LENGTH + "d", code);
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
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found with username: " + username));
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
    }

    @Transactional
    public User deleteUserById(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        userRepository.deleteById(userId);
        return user;
    }

    public User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("[DEBUG][UserService] getAuthenticatedUser() — SecurityContext auth: " + authentication);
        if (authentication == null || !authentication.isAuthenticated()) {
            System.out.println("[DEBUG][UserService] getAuthenticatedUser() — authentication is null or not authenticated → throwing AccessDeniedException");
            throw new AccessDeniedException("User is not authenticated");
        }
        String email = authentication.getName();
        System.out.println("[DEBUG][UserService] getAuthenticatedUser() — authenticated as: '" + email + "'");
        return findByEmail(email);
    }

    @Transactional
    public void uploadProfilePicture(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("File size exceeds 5MB limit");
        }
        User user = getAuthenticatedUser();
        user.setProfilePicture(file.getBytes());
        user.setProfilePictureContentType(contentType);
        userRepository.save(user);
    }

    @Transactional
    public void deleteProfilePicture() {
        User user = getAuthenticatedUser();
        user.setProfilePicture(null);
        user.setProfilePictureContentType(null);
        userRepository.save(user);
    }

    public User requireAuthenticatedUser(UUID requestedUserId) {
        System.out.println("[DEBUG][UserService] requireAuthenticatedUser() — requestedUserId=" + requestedUserId);
        User actingUser = getAuthenticatedUser();
        System.out.println("[DEBUG][UserService] requireAuthenticatedUser() — actingUser.id=" + actingUser.getId() + ", match=" + actingUser.getId().equals(requestedUserId));
        if (!actingUser.getId().equals(requestedUserId)) {
            System.out.println("[DEBUG][UserService] requireAuthenticatedUser() — ID mismatch → throwing AccessDeniedException");
            throw new AccessDeniedException("Access denied for requested user resource");
        }
        return actingUser;
    }
}
