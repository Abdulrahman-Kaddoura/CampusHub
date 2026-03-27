package com.campushub.backend.dtos.chat;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class ChatMessageResponseDTO {
    private UUID messageId;
    private UUID senderId;
    private String senderName;
    private UUID recipientId;
    private String recipientName;
    private String content;
    private LocalDateTime sentAt;
}
