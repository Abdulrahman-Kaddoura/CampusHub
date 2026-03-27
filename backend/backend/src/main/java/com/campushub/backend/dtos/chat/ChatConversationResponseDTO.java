package com.campushub.backend.dtos.chat;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class ChatConversationResponseDTO {
    private UUID partnerId;
    private String partnerName;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
}
