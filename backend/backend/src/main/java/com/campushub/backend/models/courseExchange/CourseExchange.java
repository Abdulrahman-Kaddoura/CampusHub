package com.campushub.backend.models.courseExchange;

import com.campushub.backend.models.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.envers.Audited;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "course_exchange_posts")
@Getter
@Setter
@Audited
public class CourseExchange {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "course_exchange_id", nullable = false, unique = true)
    private UUID courseExchangeId;

    @Column(name = "current_course", nullable = false, length = 120)
    private String currentCourse;

    @Column(name = "desired_course", nullable = false, length = 120)
    private String desiredCourse;

    @Column(name = "section", length = 50)
    private String section;

    @Column(name = "status", nullable = false, length = 40)
    private String status;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
//test