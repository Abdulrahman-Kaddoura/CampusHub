package com.campushub.backend.repositories.chat;

import com.campushub.backend.models.chat.Message;
import com.campushub.backend.models.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    List<Message> findBySenderOrRecipientOrderBySentAtDesc(User sender, User recipient);

    void deleteBySenderOrRecipient(User sender, User recipient);

    List<Message> findBySenderAndRecipientOrSenderAndRecipientOrderBySentAtAsc(
            User sender,
            User recipient,
            User reverseSender,
            User reverseRecipient
    );
}
