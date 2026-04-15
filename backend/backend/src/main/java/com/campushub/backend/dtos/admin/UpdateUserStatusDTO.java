package com.campushub.backend.dtos.admin;

import com.campushub.backend.enums.user.UserStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserStatusDTO {

    @NotNull(message = "Status is required")
    private UserStatus status;
}
