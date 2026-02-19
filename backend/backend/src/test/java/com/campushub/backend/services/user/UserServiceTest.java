package com.campushub.backend.services.user;

import com.campushub.backend.enums.user.UserStatus;
import com.campushub.backend.models.user.User;
import com.campushub.backend.repositories.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.modelmapper.ModelMapper;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private UserService userService;

    @Test
    void createUserHashesPlaintextPasswordsUsingPasswordEncoder() {
        User user = new User();
        user.setPassword("plainPassword123");

        when(passwordEncoder.encode("plainPassword123")).thenReturn("$2a$10$encodedPasswordHash");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User createdUser = userService.createUser(user);

        assertEquals("$2a$10$encodedPasswordHash", createdUser.getPassword());
        assertEquals(UserStatus.PENDING, createdUser.getStatus());
        assertNotNull(createdUser.getCart());
        assertEquals(createdUser, createdUser.getCart().getUser());
        verify(passwordEncoder).encode("plainPassword123");
    }

    @Test
    void createUserDoesNotRehashBCryptPasswords() {
        User user = new User();
        user.setPassword("$2a$10$alreadyHashedPassword");

        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User createdUser = userService.createUser(user);

        assertEquals("$2a$10$alreadyHashedPassword", createdUser.getPassword());
    }
}
