package com.campushub.backend.models.listings;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.envers.Audited;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "listing_images")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Audited
public class ListingImage {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "image_id")
    private UUID imageId;

    @NotBlank
    @Column(name = "file_name")
    private String fileName;

    @NotBlank
    @Column(name = "file_type")
    private String fileType;

    @Lob
    @Column(name = "image_data")
    @NotNull
    private byte[] imageData;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "upload_date")
    private LocalDateTime uploadDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;

//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "wanted_item_id", nullable = false)
//    private WantedItem wantedItem;
}