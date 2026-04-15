package com.campushub.backend.services.admin;

import com.campushub.backend.dtos.admin.AdminDashboardDTO;
import com.campushub.backend.dtos.admin.AdminUserDTO;
import com.campushub.backend.enums.listings.ListingStatus;
import com.campushub.backend.enums.user.UserRole;
import com.campushub.backend.enums.user.UserStatus;
import com.campushub.backend.exceptions.user.UserNotFoundException;
import com.campushub.backend.models.user.User;
import com.campushub.backend.repositories.listing.ListingRepository;
import com.campushub.backend.repositories.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ListingRepository listingRepository;

    public AdminDashboardDTO getDashboard() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.findAll().stream()
                .filter(u -> u.getStatus() == UserStatus.ACTIVE).count();
        long suspendedUsers = userRepository.findAll().stream()
                .filter(u -> u.getStatus() == UserStatus.SUSPENDED).count();
        long bannedUsers = userRepository.findAll().stream()
                .filter(u -> u.getStatus() == UserStatus.BANNED).count();

        long totalListings = listingRepository.count();
        long activeListings = listingRepository.findByListingStatus(ListingStatus.PUBLISHED).size();
        long soldListings = listingRepository.findByListingStatus(ListingStatus.SOLD).size();

        return new AdminDashboardDTO(
                totalUsers, activeUsers, suspendedUsers, bannedUsers,
                totalListings, activeListings, soldListings
        );
    }

    public List<AdminUserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toAdminUserDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminUserDTO updateUserStatus(UUID userId, UserStatus newStatus) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userId));
        user.setStatus(newStatus);
        return toAdminUserDTO(userRepository.save(user));
    }

    @Transactional
    public AdminUserDTO updateUserRole(UUID userId, UserRole newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userId));
        user.setRole(newRole);
        return toAdminUserDTO(userRepository.save(user));
    }

    private AdminUserDTO toAdminUserDTO(User user) {
        return new AdminUserDTO(
                user.getId(),
                user.getUsername(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getStatus(),
                user.getRole(),
                user.getCreatedAt(),
                user.getPostedListings().size()
        );
    }
}
