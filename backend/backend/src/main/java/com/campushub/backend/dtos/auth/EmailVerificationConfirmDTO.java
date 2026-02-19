package com.campushub.backend.dtos.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmailVerificationConfirmDTO {

    @NotBlank(message = "Verification token is required")
    private String token;
}
