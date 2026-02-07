//package com.campushub.backend.models.listings;
//
//import com.campushub.backend.models.listings.Category;
//import com.campushub.backend.models.listings.ListingImage;
//import com.campushub.backend.models.user.User;
//import jakarta.persistence.*;
//import lombok.Getter;
//import lombok.Setter;
//import org.hibernate.envers.Audited;
//
//import java.math.BigDecimal;
//import java.time.LocalDateTime;
//import java.util.ArrayList;
//import java.util.List;
//import java.util.UUID;
//
//@Entity
//@Table(name = "wanted_items")
//@Getter
//@Setter
//@Audited
//public class WantedItem {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.UUID)
//    @Column(name = "item_id", nullable = false, unique = true)
//    private UUID wantedItemId;
//
//    @Column(name = "title", nullable = false, length = 100)
//    private String title;
//
//    @Column(name = "description", length = 500)
//    private String description;
//
//    @Column(name = "lower_budget", precision = 10, scale = 2)
//    private BigDecimal lowerBudget;
//
//    @Column(name = "upper_budget", precision = 10, scale = 2)
//    private BigDecimal upperBudget;
//
//    @Column(name = "created_at", nullable = false, updatable = false)
//    private LocalDateTime createdAt;
//
//    @Column(name = "updated_at", nullable = false)
//    private LocalDateTime updatedAt;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "category_id", nullable = false)
//    private Category category;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "user_id", nullable = false)
//    private User user;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "buyer_id")
//    private User buyer;
//
//    @OneToMany(mappedBy = "wantedItem", cascade = CascadeType.ALL, orphanRemoval = true)
//    private List<ListingImage> listingImages = new ArrayList<>();
//
//    @PrePersist
//    protected void onCreate() {
//        createdAt = LocalDateTime.now();
//        updatedAt = LocalDateTime.now();
//    }
//
//    @PreUpdate
//    protected void onUpdate() {
//        updatedAt = LocalDateTime.now();
//    }
//}
