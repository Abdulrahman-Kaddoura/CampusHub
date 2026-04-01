package com.campushub.backend.dtos.chat;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class ChatUserResponseDTO {
    private UUID userId;
    private String displayName;
}
