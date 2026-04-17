package com.campushub.backend.controllers.admin;

import com.campushub.backend.configurations.togglz.Features;
import com.campushub.backend.dtos.admin.*;
import com.campushub.backend.services.admin.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.togglz.core.manager.FeatureManager;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin")
@Tag(name = "Admin", description = "Admin panel APIs — restricted to ADMIN role")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private FeatureManager featureManager;

    // ─── Analytics ────────────────────────────────────────────────────────────

    @GetMapping("/dashboard")
    @Operation(summary = "Get platform analytics / dashboard stats")
    public ResponseEntity<AdminDashboardDTO> getDashboard() {
        if (!featureManager.isActive(Features.ADMIN_GET_DASHBOARD)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(adminService.getDashboard());
    }

    // ─── Users ────────────────────────────────────────────────────────────────

    @GetMapping("/users")
    @Operation(summary = "Get all users")
    public ResponseEntity<List<AdminUserDTO>> getAllUsers() {
        if (!featureManager.isActive(Features.ADMIN_GET_USERS)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PatchMapping("/users/{userId}/status")
    @Operation(summary = "Update a user's status (ACTIVE, SUSPENDED, BANNED, etc.)")
    public ResponseEntity<AdminUserDTO> updateUserStatus(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateUserStatusDTO dto) {
        if (!featureManager.isActive(Features.ADMIN_UPDATE_USER_STATUS)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(adminService.updateUserStatus(userId, dto.getStatus()));
    }

    @DeleteMapping("/users/{userId}")
    @Operation(summary = "Permanently delete a user and all their content")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID userId) {
        if (!featureManager.isActive(Features.ADMIN_DELETE_USER)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        adminService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/users/ban-by-email")
    @Operation(summary = "Ban a user by email address")
    public ResponseEntity<AdminUserDTO> banUserByEmail(@Valid @RequestBody BanUserByEmailDTO dto) {
        if (!featureManager.isActive(Features.ADMIN_BAN_USER_BY_EMAIL)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(adminService.banUserByEmail(dto.getEmail()));
    }

    @PatchMapping("/users/{userId}/role")
    @Operation(summary = "Update a user's role (STUDENT, ADMIN)")
    public ResponseEntity<AdminUserDTO> updateUserRole(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateUserRoleDTO dto) {
        if (!featureManager.isActive(Features.ADMIN_UPDATE_USER_ROLE)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(adminService.updateUserRole(userId, dto.getRole()));
    }

    // ─── Posts: Listings ──────────────────────────────────────────────────────

    @GetMapping("/posts/listings")
    @Operation(summary = "Get all marketplace listings (admin view)")
    public ResponseEntity<List<AdminListingDTO>> getAllListings() {
        if (!featureManager.isActive(Features.ADMIN_GET_POSTS)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(adminService.getAllListings());
    }

    @DeleteMapping("/posts/listings/{listingId}")
    @Operation(summary = "Delete a marketplace listing")
    public ResponseEntity<Void> deleteListing(@PathVariable UUID listingId) {
        if (!featureManager.isActive(Features.ADMIN_DELETE_POST)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        adminService.deleteListing(listingId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/posts/listings/{listingId}")
    @Operation(summary = "Edit a marketplace listing")
    public ResponseEntity<AdminListingDTO> updateListing(
            @PathVariable UUID listingId,
            @RequestBody AdminUpdateListingDTO dto) {
        if (!featureManager.isActive(Features.ADMIN_UPDATE_POST)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(adminService.updateListing(listingId, dto));
    }

    // ─── Posts: Dorms ─────────────────────────────────────────────────────────

    @GetMapping("/posts/dorms")
    @Operation(summary = "Get all housing/dorm posts (admin view)")
    public ResponseEntity<List<AdminDormDTO>> getAllDorms() {
        if (!featureManager.isActive(Features.ADMIN_GET_POSTS)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(adminService.getAllDorms());
    }

    @DeleteMapping("/posts/dorms/{dormId}")
    @Operation(summary = "Delete a housing/dorm post")
    public ResponseEntity<Void> deleteDorm(@PathVariable UUID dormId) {
        if (!featureManager.isActive(Features.ADMIN_DELETE_POST)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        adminService.deleteDorm(dormId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/posts/dorms/{dormId}")
    @Operation(summary = "Edit a housing/dorm post")
    public ResponseEntity<AdminDormDTO> updateDorm(
            @PathVariable UUID dormId,
            @RequestBody AdminUpdateDormDTO dto) {
        if (!featureManager.isActive(Features.ADMIN_UPDATE_POST)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(adminService.updateDorm(dormId, dto));
    }

    // ─── Posts: Tutoring ──────────────────────────────────────────────────────

    @GetMapping("/posts/tutoring")
    @Operation(summary = "Get all tutoring posts (admin view)")
    public ResponseEntity<List<AdminTutoringDTO>> getAllTutoring() {
        if (!featureManager.isActive(Features.ADMIN_GET_POSTS)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(adminService.getAllTutoring());
    }

    @DeleteMapping("/posts/tutoring/{tutoringId}")
    @Operation(summary = "Delete a tutoring post")
    public ResponseEntity<Void> deleteTutoring(@PathVariable UUID tutoringId) {
        if (!featureManager.isActive(Features.ADMIN_DELETE_POST)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        adminService.deleteTutoring(tutoringId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/posts/tutoring/{tutoringId}")
    @Operation(summary = "Edit a tutoring post")
    public ResponseEntity<AdminTutoringDTO> updateTutoring(
            @PathVariable UUID tutoringId,
            @RequestBody AdminUpdateTutoringDTO dto) {
        if (!featureManager.isActive(Features.ADMIN_UPDATE_POST)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(adminService.updateTutoring(tutoringId, dto));
    }

    // ─── Posts: Course Exchange ────────────────────────────────────────────────

    @GetMapping("/posts/course-exchange")
    @Operation(summary = "Get all course exchange posts (admin view)")
    public ResponseEntity<List<AdminCourseExchangeDTO>> getAllCourseExchanges() {
        if (!featureManager.isActive(Features.ADMIN_GET_POSTS)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(adminService.getAllCourseExchanges());
    }

    @DeleteMapping("/posts/course-exchange/{courseExchangeId}")
    @Operation(summary = "Delete a course exchange post")
    public ResponseEntity<Void> deleteCourseExchange(@PathVariable UUID courseExchangeId) {
        if (!featureManager.isActive(Features.ADMIN_DELETE_POST)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        adminService.deleteCourseExchange(courseExchangeId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/posts/course-exchange/{courseExchangeId}")
    @Operation(summary = "Edit a course exchange post")
    public ResponseEntity<AdminCourseExchangeDTO> updateCourseExchange(
            @PathVariable UUID courseExchangeId,
            @RequestBody AdminUpdateCourseExchangeDTO dto) {
        if (!featureManager.isActive(Features.ADMIN_UPDATE_POST)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(adminService.updateCourseExchange(courseExchangeId, dto));
    }
}
