package com.campushub.backend.controllers.admin;

import com.campushub.backend.configurations.togglz.Features;
import com.campushub.backend.dtos.admin.AdminDashboardDTO;
import com.campushub.backend.dtos.admin.AdminUserDTO;
import com.campushub.backend.dtos.admin.UpdateUserRoleDTO;
import com.campushub.backend.dtos.admin.UpdateUserStatusDTO;
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

    @GetMapping("/dashboard")
    @Operation(summary = "Get platform dashboard stats")
    public ResponseEntity<AdminDashboardDTO> getDashboard() {
        if (!featureManager.isActive(Features.ADMIN_GET_DASHBOARD)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(adminService.getDashboard());
    }

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
}
