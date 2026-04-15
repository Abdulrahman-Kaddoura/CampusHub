package com.campushub.backend.dtos.admin;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDTO {

    // Users
    private long totalUsers;
    private long activeUsers;
    private long suspendedUsers;
    private long bannedUsers;
    private long pendingUsers;
    private long deletedUsers;

    // Marketplace Listings
    private long totalListings;
    private long publishedListings;
    private long soldListings;
    private long draftListings;
    private long archivedListings;

    // Other post types
    private long totalDormPosts;
    private long totalTutoringPosts;
    private long totalCourseExchangePosts;
}
