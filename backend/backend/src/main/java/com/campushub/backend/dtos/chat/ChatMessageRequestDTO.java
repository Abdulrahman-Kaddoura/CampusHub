package com.campushub.backend.dtos.chat;

import com.campushub.backend.enums.chat.MessageType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class ChatMessageRequestDTO {

    @NotNull(message = "recipientId is required")
    private UUID recipientId;

    @Size(max = 2000, message = "content must be at most 2000 characters")
    private String content;

    private MessageType messageType = MessageType.TEXT;

    private Double latitude;

    private Double longitude;
}
