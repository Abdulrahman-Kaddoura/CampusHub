package com.campushub.backend.controllers.chat;

import com.campushub.backend.dtos.chat.ChatConversationResponseDTO;
import com.campushub.backend.dtos.chat.ChatMessageRequestDTO;
import com.campushub.backend.dtos.chat.ChatMessageResponseDTO;
import com.campushub.backend.dtos.chat.ChatUserResponseDTO;
import com.campushub.backend.services.chat.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;


@RestController
@RequestMapping({"/chat", "/api/chat"})
@Tag(name = "Chat", description = "User-to-user messaging operations")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping("/messages")
    @Operation(summary = "Send message", description = "Sends a chat message from the authenticated user to another user.")
    public ResponseEntity<ChatMessageResponseDTO> sendMessage(@Valid @RequestBody ChatMessageRequestDTO requestDTO) {
        ChatMessageResponseDTO created = chatService.sendMessage(requestDTO.getRecipientId(), requestDTO.getContent());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/messages/{partnerId}")
    @Operation(summary = "Get conversation", description = "Returns all messages between the authenticated user and a partner user.")
    public ResponseEntity<List<ChatMessageResponseDTO>> getConversation(@PathVariable UUID partnerId) {
        return ResponseEntity.ok(chatService.getConversation(partnerId));
    }

    @GetMapping("/conversations")
    @Operation(summary = "Get conversations", description = "Returns all user conversations for the authenticated user.")
    public ResponseEntity<List<ChatConversationResponseDTO>> getConversations() {
        return ResponseEntity.ok(chatService.getConversations());
    }

    @GetMapping("/users")
    @Operation(summary = "Get chat users", description = "Returns all users the authenticated user can message.")
    public ResponseEntity<List<ChatUserResponseDTO>> getUsers() {
        return ResponseEntity.ok(chatService.getAvailableUsers());
    }
}
