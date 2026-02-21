    package com.campushub.backend.models.user;

    import com.campushub.backend.enums.user.UserStatus;
    import com.campushub.backend.models.cart.Cart;
    import com.campushub.backend.models.listings.Listing;
    import jakarta.persistence.*;
    import lombok.Getter;
    import lombok.Setter;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {
        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        @Column(name = "user_id", nullable = false, unique = true)
        private UUID id;

        @Column(name = "username", nullable = false, unique = true, length = 50)
        private String username;

        @Column(name = "first_name", nullable = false, length = 100)
        private String firstName;

        @Column(name = "last_name", nullable = false, length = 100)
        private String lastName;

        @Column(name = "email", nullable = false, unique = true, length = 255)
        private String email;

        @Column(name = "phone_number", unique = true, length = 20)
        private String phoneNumber;

        @Column(nullable = false, updatable = false)
        private LocalDateTime createdAt;

        @PrePersist
        protected void onCreate() {
            createdAt = LocalDateTime.now();
            updatedAt = LocalDateTime.now();
        }

        @Column(nullable = false)
        private LocalDateTime updatedAt;

        @PreUpdate
        protected void onUpdate() {
            updatedAt = LocalDateTime.now();
        }

        @Enumerated(EnumType.STRING)
        @Column(nullable = false, length = 20)
        private UserStatus status = UserStatus.PENDING;

        @Column(name = "password", nullable = false)
        private String password;

        @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
        private List<Listing> postedListings = new ArrayList<>();

        @OneToMany(mappedBy = "buyer")
        private List<Listing> purchasedListings = new ArrayList<>();

        @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
        private Cart cart;

        public void addListing(Listing listing) {
            postedListings.add(listing);
            listing.setUser(this);
        }

        public void addPurchase(Listing listing) {
            purchasedListings.add(listing);
            listing.setBuyer(this);
        }
    }
