package com.campushub.backend.services.tutoring;

import com.campushub.backend.models.tutoring.Tutoring;
import com.campushub.backend.models.user.User;
import com.campushub.backend.repositories.tutoring.TutoringRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TutoringServiceTest {

    @Mock
    private TutoringRepository tutoringRepository;

    @InjectMocks
    private TutoringService tutoringService;

    // -------------------------------------------------------------------------
    // createTutoring
    // -------------------------------------------------------------------------

    @Test
    void createTutoring_savesAndReturnsTutoring() {
        Tutoring tutoring = new Tutoring();
        when(tutoringRepository.save(tutoring)).thenReturn(tutoring);

        Tutoring result = tutoringService.createTutoring(tutoring);

        assertSame(tutoring, result);
        verify(tutoringRepository).save(tutoring);
    }

    // -------------------------------------------------------------------------
    // getAllTutoringPosts
    // -------------------------------------------------------------------------

    @Test
    void getAllTutoringPosts_returnsAll() {
        List<Tutoring> posts = List.of(new Tutoring(), new Tutoring());
        when(tutoringRepository.findAll()).thenReturn(posts);

        List<Tutoring> result = tutoringService.getAllTutoringPosts();

        assertSame(posts, result);
        assertEquals(2, result.size());
    }

    @Test
    void getAllTutoringPosts_returnsEmptyList_whenNoneExist() {
        when(tutoringRepository.findAll()).thenReturn(List.of());

        List<Tutoring> result = tutoringService.getAllTutoringPosts();

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    // -------------------------------------------------------------------------
    // getAllTutoringPostsByUser
    // -------------------------------------------------------------------------

    @Test
    void getAllTutoringPostsByUser_returnsFilteredResults() {
        UUID userId = UUID.randomUUID();
        List<Tutoring> userPosts = List.of(new Tutoring());
        when(tutoringRepository.findByUserId(userId)).thenReturn(userPosts);

        List<Tutoring> result = tutoringService.getAllTutoringPostsByUser(userId);

        assertSame(userPosts, result);
        assertEquals(1, result.size());
    }

    // -------------------------------------------------------------------------
    // deleteTutoringByIdForUser
    // -------------------------------------------------------------------------

    @Test
    void deleteTutoringByIdForUser_throwsResponseStatusException_whenNotFound() {
        UUID tutoringId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        when(tutoringRepository.findById(tutoringId)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class,
                () -> tutoringService.deleteTutoringByIdForUser(tutoringId, userId));
        verify(tutoringRepository, never()).delete(any());
    }

    @Test
    void deleteTutoringByIdForUser_throwsAccessDeniedException_whenNotOwner() {
        UUID tutoringId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        UUID actingUserId = UUID.randomUUID();

        User owner = new User();
        owner.setId(ownerId);

        Tutoring tutoring = new Tutoring();
        tutoring.setUser(owner);

        when(tutoringRepository.findById(tutoringId)).thenReturn(Optional.of(tutoring));

        assertThrows(AccessDeniedException.class,
                () -> tutoringService.deleteTutoringByIdForUser(tutoringId, actingUserId));
        verify(tutoringRepository, never()).delete(any());
    }

    @Test
    void deleteTutoringByIdForUser_deletesTutoring_whenOwner() {
        UUID tutoringId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();

        User owner = new User();
        owner.setId(ownerId);

        Tutoring tutoring = new Tutoring();
        tutoring.setUser(owner);

        when(tutoringRepository.findById(tutoringId)).thenReturn(Optional.of(tutoring));
        doNothing().when(tutoringRepository).delete(tutoring);

        Tutoring result = tutoringService.deleteTutoringByIdForUser(tutoringId, ownerId);

        assertSame(tutoring, result);
        verify(tutoringRepository).delete(tutoring);
    }
}
