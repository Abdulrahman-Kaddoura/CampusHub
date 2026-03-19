package com.campushub.backend.models.user;

import com.campushub.backend.enums.user.UserStatus;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SecurityUserTest {

    @Test
    void usernameAndPassword_areMappedFromUser() {
        User user = new User();
        user.setEmail("student@campushub.edu");
        user.setPassword("secret");

        SecurityUser securityUser = new SecurityUser(user);

        assertEquals("student@campushub.edu", securityUser.getUsername());
        assertEquals("secret", securityUser.getPassword());
    }

    @Test
    void accountState_checksStatusFlags() {
        User activeUser = new User();
        activeUser.setStatus(UserStatus.ACTIVE);

        SecurityUser activeSecurityUser = new SecurityUser(activeUser);

        assertTrue(activeSecurityUser.isAccountNonLocked());
        assertTrue(activeSecurityUser.isEnabled());

        User bannedUser = new User();
        bannedUser.setStatus(UserStatus.BANNED);

        SecurityUser bannedSecurityUser = new SecurityUser(bannedUser);

        assertFalse(bannedSecurityUser.isAccountNonLocked());
        assertFalse(bannedSecurityUser.isEnabled());
    }
}
