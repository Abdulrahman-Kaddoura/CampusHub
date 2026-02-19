package com.campushub.backend.dtos.auth;

import java.time.LocalDateTime;

public record PasswordResetTokenResponseDTO(String message, String token, LocalDateTime expiresAt) {
}
