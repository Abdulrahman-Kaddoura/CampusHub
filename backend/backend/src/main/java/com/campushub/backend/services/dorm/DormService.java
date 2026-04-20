package com.campushub.backend.services.dorm;

import com.campushub.backend.dtos.dorm.DormRequestDTO;
import com.campushub.backend.models.dorm.Dorm;
import com.campushub.backend.repositories.dorm.DormRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DormService {

    private final DormRepository dormRepository;

    public Dorm createDorm(Dorm dorm) {
        return dormRepository.save(dorm);
    }

    public List<Dorm> getAllDorms() {
        return dormRepository.findAll();
    }

    public List<Dorm> getAllDormsByUser(UUID userId) {
        return dormRepository.findByUserId(userId);
    }

    @Transactional
    public Dorm updateDorm(UUID dormId, UUID actingUserId, DormRequestDTO dto) {
        Dorm dorm = dormRepository.findById(dormId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dorm not found with id: " + dormId));

        if (!dorm.getUser().getId().equals(actingUserId)) {
            throw new AccessDeniedException("You can only update your own dorm listings");
        }

        dorm.setTitle(dto.getTitle());
        dorm.setDescription(dto.getDescription());
        dorm.setLocation(dto.getLocation());
        dorm.setRoomType(dto.getRoomType());
        dorm.setMonthlyRent(dto.getMonthlyRent());
        dorm.setAvailableFrom(dto.getAvailableFrom());

        return dormRepository.save(dorm);
    }

    @Transactional
    public Dorm deleteDormByIdForUser(UUID dormId, UUID actingUserId) {
        Dorm dorm = dormRepository.findById(dormId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dorm not found with id: " + dormId));

        if (!dorm.getUser().getId().equals(actingUserId)) {
            throw new AccessDeniedException("You can only delete your own dorm listings");
        }

        dormRepository.delete(dorm);
        return dorm;
    }
}