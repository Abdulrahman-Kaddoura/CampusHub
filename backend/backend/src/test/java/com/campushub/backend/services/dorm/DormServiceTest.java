package com.campushub.backend.services.dorm;

import com.campushub.backend.models.dorm.Dorm;
import com.campushub.backend.models.user.User;
import com.campushub.backend.repositories.dorm.DormRepository;
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
class DormServiceTest {

    @Mock
    private DormRepository dormRepository;

    @InjectMocks
    private DormService dormService;

    // -------------------------------------------------------------------------
    // createDorm
    // -------------------------------------------------------------------------

    @Test
    void createDorm_savesAndReturnsDorm() {
        Dorm dorm = new Dorm();
        when(dormRepository.save(dorm)).thenReturn(dorm);

        Dorm result = dormService.createDorm(dorm);

        assertSame(dorm, result);
        verify(dormRepository).save(dorm);
    }

    // -------------------------------------------------------------------------
    // getAllDorms
    // -------------------------------------------------------------------------

    @Test
    void getAllDorms_returnsAllFromRepository() {
        List<Dorm> dorms = List.of(new Dorm(), new Dorm(), new Dorm());
        when(dormRepository.findAll()).thenReturn(dorms);

        List<Dorm> result = dormService.getAllDorms();

        assertSame(dorms, result);
        assertEquals(3, result.size());
    }

    @Test
    void getAllDorms_returnsEmptyList_whenNoDormsExist() {
        when(dormRepository.findAll()).thenReturn(List.of());

        List<Dorm> result = dormService.getAllDorms();

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    // -------------------------------------------------------------------------
    // getAllDormsByUser
    // -------------------------------------------------------------------------

    @Test
    void getAllDormsByUser_returnsFilteredByUserId() {
        UUID userId = UUID.randomUUID();
        List<Dorm> userDorms = List.of(new Dorm(), new Dorm());
        when(dormRepository.findByUserId(userId)).thenReturn(userDorms);

        List<Dorm> result = dormService.getAllDormsByUser(userId);

        assertSame(userDorms, result);
        assertEquals(2, result.size());
    }

    // -------------------------------------------------------------------------
    // deleteDormByIdForUser
    // -------------------------------------------------------------------------

    @Test
    void deleteDormByIdForUser_throwsResponseStatusException_whenNotFound() {
        UUID dormId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        when(dormRepository.findById(dormId)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class,
                () -> dormService.deleteDormByIdForUser(dormId, userId));
        verify(dormRepository, never()).delete(any());
    }

    @Test
    void deleteDormByIdForUser_throwsAccessDeniedException_whenNotOwner() {
        UUID dormId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        UUID actingUserId = UUID.randomUUID();

        User owner = new User();
        owner.setId(ownerId);

        Dorm dorm = new Dorm();
        dorm.setUser(owner);

        when(dormRepository.findById(dormId)).thenReturn(Optional.of(dorm));

        assertThrows(AccessDeniedException.class,
                () -> dormService.deleteDormByIdForUser(dormId, actingUserId));
        verify(dormRepository, never()).delete(any());
    }

    @Test
    void deleteDormByIdForUser_deletesDorm_whenOwner() {
        UUID dormId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();

        User owner = new User();
        owner.setId(ownerId);

        Dorm dorm = new Dorm();
        dorm.setUser(owner);

        when(dormRepository.findById(dormId)).thenReturn(Optional.of(dorm));
        doNothing().when(dormRepository).delete(dorm);

        Dorm result = dormService.deleteDormByIdForUser(dormId, ownerId);

        assertSame(dorm, result);
        verify(dormRepository).delete(dorm);
    }
}
