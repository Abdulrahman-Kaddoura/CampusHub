package com.campushub.backend.dtos.auth;

import java.time.LocalDateTime;

public record EmailVerificationTokenResponseDTO(String message, String token, LocalDateTime expiresAt) {
}
