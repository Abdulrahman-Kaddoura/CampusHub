package com.campushub.backend.dtos.chat;

import com.campushub.backend.enums.chat.MessageType;
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
    private MessageType messageType;
    private Double latitude;
    private Double longitude;
    private LocalDateTime sentAt;
}
