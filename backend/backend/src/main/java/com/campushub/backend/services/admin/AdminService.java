package com.campushub.backend.services.admin;

import com.campushub.backend.dtos.admin.*;
import com.campushub.backend.enums.listings.ListingStatus;
import com.campushub.backend.enums.user.UserRole;
import com.campushub.backend.enums.user.UserStatus;
import com.campushub.backend.exceptions.user.UserNotFoundException;
import com.campushub.backend.models.courseExchange.CourseExchange;
import com.campushub.backend.models.dorm.Dorm;
import com.campushub.backend.models.listings.Listing;
import com.campushub.backend.models.tutoring.Tutoring;
import com.campushub.backend.models.user.User;
import com.campushub.backend.repositories.courseExchange.CourseExchangeRepository;
import com.campushub.backend.repositories.dorm.DormRepository;
import com.campushub.backend.repositories.listing.ListingRepository;
import com.campushub.backend.repositories.tutoring.TutoringRepository;
import com.campushub.backend.repositories.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ListingRepository listingRepository;

    @Autowired
    private DormRepository dormRepository;

    @Autowired
    private TutoringRepository tutoringRepository;

    @Autowired
    private CourseExchangeRepository courseExchangeRepository;

    // ─── Analytics ────────────────────────────────────────────────────────────

    public AdminDashboardDTO getDashboard() {
        List<User> allUsers = userRepository.findAll();
        long totalUsers      = allUsers.size();
        long activeUsers     = allUsers.stream().filter(u -> u.getStatus() == UserStatus.ACTIVE).count();
        long suspendedUsers  = allUsers.stream().filter(u -> u.getStatus() == UserStatus.SUSPENDED).count();
        long bannedUsers     = allUsers.stream().filter(u -> u.getStatus() == UserStatus.BANNED).count();
        long pendingUsers    = allUsers.stream().filter(u -> u.getStatus() == UserStatus.PENDING).count();
        long deletedUsers    = allUsers.stream().filter(u -> u.getStatus() == UserStatus.DELETED).count();

        List<Listing> allListings = listingRepository.findAll();
        long totalListings     = allListings.size();
        long publishedListings = allListings.stream().filter(l -> l.getListingStatus() == ListingStatus.PUBLISHED).count();
        long soldListings      = allListings.stream().filter(l -> l.getListingStatus() == ListingStatus.SOLD).count();
        long draftListings     = allListings.stream().filter(l -> l.getListingStatus() == ListingStatus.DRAFT).count();
        long archivedListings  = allListings.stream().filter(l -> l.getListingStatus() == ListingStatus.ARCHIVED).count();

        long totalDormPosts           = dormRepository.count();
        long totalTutoringPosts       = tutoringRepository.count();
        long totalCourseExchangePosts = courseExchangeRepository.count();

        return new AdminDashboardDTO(
                totalUsers, activeUsers, suspendedUsers, bannedUsers, pendingUsers, deletedUsers,
                totalListings, publishedListings, soldListings, draftListings, archivedListings,
                totalDormPosts, totalTutoringPosts, totalCourseExchangePosts
        );
    }

    // ─── Users ────────────────────────────────────────────────────────────────

    public List<AdminUserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toAdminUserDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userId));
        // Null out buyer references to avoid FK violation on listings purchased by this user
        List<Listing> purchased = listingRepository.findByBuyerId(userId);
        purchased.forEach(l -> l.setBuyer(null));
        listingRepository.saveAll(purchased);
        userRepository.delete(user);
    }

    @Transactional
    public AdminUserDTO banUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("No user found with email: " + email));
        user.setStatus(UserStatus.BANNED);
        return toAdminUserDTO(userRepository.save(user));
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

    // ─── Listings (Posts) ─────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AdminListingDTO> getAllListings() {
        return listingRepository.findAll().stream()
                .map(this::toAdminListingDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteListing(UUID listingId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found: " + listingId));
        listingRepository.delete(listing);
    }

    @Transactional
    public AdminListingDTO updateListing(UUID listingId, AdminUpdateListingDTO dto) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found: " + listingId));
        if (dto.getTitle() != null)         listing.setTitle(dto.getTitle());
        if (dto.getDescription() != null)   listing.setDescription(dto.getDescription());
        if (dto.getPrice() != null)         listing.setPrice(dto.getPrice());
        if (dto.getStatus() != null)        listing.setListingStatus(dto.getStatus());
        return toAdminListingDTO(listingRepository.save(listing));
    }

    private AdminListingDTO toAdminListingDTO(Listing l) {
        String userName = l.getUser() != null
                ? l.getUser().getFirstName() + " " + l.getUser().getLastName()
                : null;
        String categoryName = l.getCategory() != null ? l.getCategory().getName() : null;
        return new AdminListingDTO(
                l.getListingId(),
                l.getTitle(),
                l.getDescription(),
                l.getPrice(),
                l.getListingStatus(),
                l.getCreatedAt(),
                l.getUpdatedAt(),
                l.getUser() != null ? l.getUser().getId() : null,
                userName,
                categoryName
        );
    }

    // ─── Dorms ────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AdminDormDTO> getAllDorms() {
        return dormRepository.findAll().stream()
                .map(this::toAdminDormDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteDorm(UUID dormId) {
        Dorm dorm = dormRepository.findById(dormId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dorm not found: " + dormId));
        dormRepository.delete(dorm);
    }

    @Transactional
    public AdminDormDTO updateDorm(UUID dormId, AdminUpdateDormDTO dto) {
        Dorm dorm = dormRepository.findById(dormId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dorm not found: " + dormId));
        if (dto.getTitle() != null)         dorm.setTitle(dto.getTitle());
        if (dto.getDescription() != null)   dorm.setDescription(dto.getDescription());
        if (dto.getLocation() != null)      dorm.setLocation(dto.getLocation());
        if (dto.getRoomType() != null)      dorm.setRoomType(dto.getRoomType());
        if (dto.getMonthlyRent() != null)   dorm.setMonthlyRent(dto.getMonthlyRent());
        if (dto.getAvailableFrom() != null) dorm.setAvailableFrom(dto.getAvailableFrom());
        return toAdminDormDTO(dormRepository.save(dorm));
    }

    private AdminDormDTO toAdminDormDTO(Dorm d) {
        String userName = d.getUser() != null
                ? d.getUser().getFirstName() + " " + d.getUser().getLastName()
                : null;
        return new AdminDormDTO(
                d.getDormId(),
                d.getTitle(),
                d.getDescription(),
                d.getLocation(),
                d.getRoomType(),
                d.getMonthlyRent(),
                d.getAvailableFrom(),
                d.getCreatedAt(),
                d.getUpdatedAt(),
                d.getUser() != null ? d.getUser().getId() : null,
                userName
        );
    }

    // ─── Tutoring ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AdminTutoringDTO> getAllTutoring() {
        return tutoringRepository.findAll().stream()
                .map(this::toAdminTutoringDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteTutoring(UUID tutoringId) {
        Tutoring t = tutoringRepository.findById(tutoringId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tutoring post not found: " + tutoringId));
        tutoringRepository.delete(t);
    }

    @Transactional
    public AdminTutoringDTO updateTutoring(UUID tutoringId, AdminUpdateTutoringDTO dto) {
        Tutoring t = tutoringRepository.findById(tutoringId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tutoring post not found: " + tutoringId));
        if (dto.getCourse() != null)      t.setCourse(dto.getCourse());
        if (dto.getTutorName() != null)   t.setTutorName(dto.getTutorName());
        if (dto.getDepartment() != null)  t.setDepartment(dto.getDepartment());
        if (dto.getFormat() != null)      t.setFormat(dto.getFormat());
        if (dto.getHourlyRate() != null)  t.setHourlyRate(dto.getHourlyRate());
        if (dto.getDescription() != null) t.setDescription(dto.getDescription());
        return toAdminTutoringDTO(tutoringRepository.save(t));
    }

    private AdminTutoringDTO toAdminTutoringDTO(Tutoring t) {
        String userName = t.getUser() != null
                ? t.getUser().getFirstName() + " " + t.getUser().getLastName()
                : null;
        return new AdminTutoringDTO(
                t.getTutoringId(),
                t.getCourse(),
                t.getTutorName(),
                t.getDepartment(),
                t.getFormat(),
                t.getHourlyRate(),
                t.getDescription(),
                t.getCreatedAt(),
                t.getUpdatedAt(),
                t.getUser() != null ? t.getUser().getId() : null,
                userName
        );
    }

    // ─── Course Exchange ───────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AdminCourseExchangeDTO> getAllCourseExchanges() {
        return courseExchangeRepository.findAll().stream()
                .map(this::toAdminCourseExchangeDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteCourseExchange(UUID courseExchangeId) {
        CourseExchange ce = courseExchangeRepository.findById(courseExchangeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course exchange post not found: " + courseExchangeId));
        courseExchangeRepository.delete(ce);
    }

    @Transactional
    public AdminCourseExchangeDTO updateCourseExchange(UUID courseExchangeId, AdminUpdateCourseExchangeDTO dto) {
        CourseExchange ce = courseExchangeRepository.findById(courseExchangeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course exchange post not found: " + courseExchangeId));
        if (dto.getCurrentCourse() != null)  ce.setCurrentCourse(dto.getCurrentCourse());
        if (dto.getDesiredCourse() != null)  ce.setDesiredCourse(dto.getDesiredCourse());
        if (dto.getSection() != null)        ce.setSection(dto.getSection());
        if (dto.getStatus() != null)         ce.setStatus(dto.getStatus());
        if (dto.getNotes() != null)          ce.setNotes(dto.getNotes());
        return toAdminCourseExchangeDTO(courseExchangeRepository.save(ce));
    }

    private AdminCourseExchangeDTO toAdminCourseExchangeDTO(CourseExchange ce) {
        String userName = ce.getUser() != null
                ? ce.getUser().getFirstName() + " " + ce.getUser().getLastName()
                : null;
        return new AdminCourseExchangeDTO(
                ce.getCourseExchangeId(),
                ce.getCurrentCourse(),
                ce.getDesiredCourse(),
                ce.getSection(),
                ce.getStatus(),
                ce.getNotes(),
                ce.getCreatedAt(),
                ce.getUpdatedAt(),
                ce.getUser() != null ? ce.getUser().getId() : null,
                userName
        );
    }
}
