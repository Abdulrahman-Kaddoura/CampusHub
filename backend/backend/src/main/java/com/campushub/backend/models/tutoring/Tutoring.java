package com.campushub.backend.models.tutoring;

import com.campushub.backend.models.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.envers.Audited;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tutoring_posts")
@Getter
@Setter
@Audited
public class Tutoring {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "tutoring_id", nullable = false, unique = true)
    private UUID tutoringId;

    @Column(name = "course", nullable = false, length = 120)
    private String course;

    @Column(name = "tutor_name", nullable = false, length = 120)
    private String tutorName;

    @Column(name = "department", nullable = false, length = 80)
    private String department;

    @Column(name = "format", nullable = false, length = 50)
    private String format;

    @Column(name = "hourly_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal hourlyRate;

    @Column(name = "description", length = 500)
    private String description;

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