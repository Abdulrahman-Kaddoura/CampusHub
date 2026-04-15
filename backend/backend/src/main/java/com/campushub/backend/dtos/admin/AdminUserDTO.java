package com.campushub.backend.dtos.admin;

import com.campushub.backend.enums.user.UserRole;
import com.campushub.backend.enums.user.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserDTO {

    private UUID id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private UserStatus status;
    private UserRole role;
    private LocalDateTime createdAt;
    private int listingCount;
}
