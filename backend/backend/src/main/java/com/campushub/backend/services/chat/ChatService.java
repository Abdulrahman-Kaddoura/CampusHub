package com.campushub.backend.services.chat;

import com.campushub.backend.dtos.chat.ChatConversationResponseDTO;
import com.campushub.backend.dtos.chat.ChatMessageResponseDTO;
import com.campushub.backend.dtos.chat.ChatUserResponseDTO;
import com.campushub.backend.models.chat.Message;
import com.campushub.backend.models.user.User;
import com.campushub.backend.repositories.chat.MessageRepository;
import com.campushub.backend.repositories.user.UserRepository;
import com.campushub.backend.services.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ChatService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public ChatMessageResponseDTO sendMessage(UUID recipientId, String rawContent) {
        User sender = userService.getAuthenticatedUser();
        if (sender.getId().equals(recipientId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot message yourself");
        }

        User recipient = userService.findById(recipientId);

        String content = rawContent == null ? "" : rawContent.trim();
        if (content.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message content must not be blank");
        }

        Message message = new Message();
        message.setSender(sender);
        message.setRecipient(recipient);
        message.setContent(content);

        Message created = messageRepository.save(message);
        return toMessageResponse(created);
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponseDTO> getConversation(UUID partnerId) {
        User currentUser = userService.getAuthenticatedUser();
        User partner = userService.findById(partnerId);

        List<Message> messages = messageRepository
                .findBySenderAndRecipientOrSenderAndRecipientOrderBySentAtAsc(currentUser, partner, partner, currentUser);

        return messages.stream().map(this::toMessageResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ChatConversationResponseDTO> getConversations() {
        User currentUser = userService.getAuthenticatedUser();
        List<Message> messages = messageRepository.findBySenderOrRecipientOrderBySentAtDesc(currentUser, currentUser);

        Map<UUID, ChatConversationResponseDTO> latestByPartner = new LinkedHashMap<>();
        for (Message message : messages) {
            User partner = message.getSender().getId().equals(currentUser.getId())
                    ? message.getRecipient()
                    : message.getSender();

            if (latestByPartner.containsKey(partner.getId())) {
                continue;
            }

            ChatConversationResponseDTO conversation = new ChatConversationResponseDTO();
            conversation.setPartnerId(partner.getId());
            conversation.setPartnerName(buildDisplayName(partner));
            conversation.setLastMessage(message.getContent());
            conversation.setLastMessageAt(message.getSentAt());
            latestByPartner.put(partner.getId(), conversation);
        }

        return new ArrayList<>(latestByPartner.values());
    }

    @Transactional(readOnly = true)
    public List<ChatUserResponseDTO> getAvailableUsers() {
        User currentUser = userService.getAuthenticatedUser();
        return userRepository.findAll().stream()
                .filter(user -> !user.getId().equals(currentUser.getId()))
                .map(this::toChatUser)
                .toList();
    }

    private ChatMessageResponseDTO toMessageResponse(Message message) {
        ChatMessageResponseDTO response = new ChatMessageResponseDTO();
        response.setMessageId(message.getMessageId());
        response.setSenderId(message.getSender().getId());
        response.setSenderName(buildDisplayName(message.getSender()));
        response.setRecipientId(message.getRecipient().getId());
        response.setRecipientName(buildDisplayName(message.getRecipient()));
        response.setContent(message.getContent());
        response.setSentAt(message.getSentAt());
        return response;
    }

    private ChatUserResponseDTO toChatUser(User user) {
        ChatUserResponseDTO chatUser = new ChatUserResponseDTO();
        chatUser.setUserId(user.getId());
        chatUser.setDisplayName(buildDisplayName(user));
        return chatUser;
    }

    private String buildDisplayName(User user) {
        String fullName = (user.getFirstName() + " " + user.getLastName()).trim();
        return fullName.isBlank() ? user.getUsername() : fullName;
    }
}
