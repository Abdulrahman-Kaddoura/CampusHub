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

    private long totalUsers;
    private long activeUsers;
    private long suspendedUsers;
    private long bannedUsers;
    private long totalListings;
    private long activeListings;
    private long soldListings;
}
