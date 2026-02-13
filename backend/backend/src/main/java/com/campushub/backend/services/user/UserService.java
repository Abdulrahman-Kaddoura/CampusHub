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

import java.time.LocalDateTime;
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
        user.setEmailVerificationExpiresAt(LocalDateTime.now().plusHours(1));

        Cart cart = new Cart();
        cart.setUser(user);
        user.setCart(cart);
        User createdUser = userRepository.save(user);
        emailVerificationService.sendVerificationEmail(createdUser);
        return createdUser;
    }

    @Transactional
    public User verifyEmail(String email, String token) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));

        if (user.getStatus() == UserStatus.ACTIVE) {
            return user;
        }

        boolean tokenMatches = token.equals(user.getEmailVerificationToken());
        boolean tokenNotExpired = user.getEmailVerificationExpiresAt() != null
                && user.getEmailVerificationExpiresAt().isAfter(LocalDateTime.now());

        if (!tokenMatches || !tokenNotExpired) {
            throw new IllegalArgumentException("Verification token is invalid or expired");
        }

        user.setStatus(UserStatus.ACTIVE);
        user.setEmailVerifiedAt(LocalDateTime.now());
        user.setEmailVerificationToken(null);
        user.setEmailVerificationExpiresAt(null);
        return userRepository.save(user);
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
