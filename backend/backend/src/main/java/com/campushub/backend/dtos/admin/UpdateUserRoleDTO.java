package com.campushub.backend.dtos.admin;

import com.campushub.backend.enums.user.UserRole;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserRoleDTO {

    @NotNull(message = "Role is required")
    private UserRole role;
}
