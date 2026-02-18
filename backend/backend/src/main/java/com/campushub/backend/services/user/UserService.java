package com.campushub.backend.services.user;

import com.campushub.backend.dtos.user.UserRequestDTO;
import com.campushub.backend.enums.user.UserStatus;
import com.campushub.backend.models.cart.Cart;
import com.campushub.backend.models.user.User;
import com.campushub.backend.repositories.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;

    public User registerUser(UserRequestDTO userRequestDTO) {
        String normalizedUsername = userRequestDTO.getUsername().trim();
        String normalizedEmail = userRequestDTO.getEmail().trim().toLowerCase();

        if (userRepository.findByUsername(normalizedUsername).isPresent()) {
            throw new RuntimeException("Username is already in use");
        }
        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new RuntimeException("Email is already in use");
        }

        User user = modelMapper.map(userRequestDTO, User.class);
        user.setUsername(normalizedUsername);
        user.setEmail(normalizedEmail);

        String phoneNumber = userRequestDTO.getPhoneNumber();
        if (phoneNumber != null) {
            phoneNumber = phoneNumber.trim();
            user.setPhoneNumber(phoneNumber.isEmpty() ? null : phoneNumber);
        }

        user.setPassword(passwordEncoder.encode(userRequestDTO.getPassword()));
        return createUser(user);
    }

    public User createUser(User user) {
        user.setStatus(UserStatus.PENDING);
        if (user.getPassword() != null
                && !user.getPassword().startsWith("$2a$")
                && !user.getPassword().startsWith("$2b$")
                && !user.getPassword().startsWith("$2y$")) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        Cart cart = new Cart();
        cart.setUser(user);
        user.setCart(cart);
        return userRepository.save(user);
    }

    public User findById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username.trim())
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    @Transactional
    public User deleteUserById(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        userRepository.deleteById(userId);

        return user;
    }
}
