package com.campushub.backend.services.tutoring;

import com.campushub.backend.models.tutoring.Tutoring;
import com.campushub.backend.repositories.tutoring.TutoringRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TutoringService {

    private final TutoringRepository tutoringRepository;

    public Tutoring createTutoring(Tutoring tutoring) {
        return tutoringRepository.save(tutoring);
    }

    public List<Tutoring> getAllTutoringPosts() {
        return tutoringRepository.findAll();
    }

    public List<Tutoring> getAllTutoringPostsByUser(UUID userId) {
        return tutoringRepository.findByUserId(userId);
    }

    @Transactional
    public Tutoring deleteTutoringByIdForUser(UUID tutoringId, UUID actingUserId) {
        Tutoring tutoring = tutoringRepository.findById(tutoringId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tutoring post not found with id: " + tutoringId));

        if (!tutoring.getUser().getId().equals(actingUserId)) {
            throw new AccessDeniedException("You can only delete your own tutoring posts");
        }

        tutoringRepository.delete(tutoring);
        return tutoring;
    }
}
