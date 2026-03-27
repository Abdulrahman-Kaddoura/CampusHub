package com.campushub.backend.dtos.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class ChatMessageRequestDTO {

    @NotNull(message = "recipientId is required")
    private UUID recipientId;

    @NotBlank(message = "content is required")
    private String content;
}
