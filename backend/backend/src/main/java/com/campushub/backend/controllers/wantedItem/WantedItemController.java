//package com.campushub.backend.controllers.wantedItem;
//
//import com.campushub.backend.dtos.wantedItem.WantedItemRequestDTO;
//import com.campushub.backend.dtos.wantedItem.WantedItemResponseDTO;
//import com.campushub.backend.models.listings.Category;
//import com.campushub.backend.models.user.User;
//import com.campushub.backend.models.wanteditems.WantedItem;
//import com.campushub.backend.services.wantedItem.WantedItemService;
//import com.campushub.backend.services.listings.CategoryService;
//import com.campushub.backend.services.user.UserService;
//import io.swagger.v3.oas.annotations.Operation;
//import io.swagger.v3.oas.annotations.tags.Tag;
//import jakarta.validation.Valid;
//import org.modelmapper.ModelMapper;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.server.ResponseStatusException;
//import org.togglz.core.manager.FeatureManager;
//
//import java.util.List;
//import java.util.UUID;
//import java.util.stream.Collectors;
//
//import static com.campushub.backend.configurations.togglz.Features.*;
//
//@RestController
//@RequestMapping("/wanted-items")
//@Tag(name = "Wanted Items", description = "Wanted item related operations")
//public class WantedItemController {
//
//    @Autowired
//    WantedItemService wantedItemService;
//
//    @Autowired
//    ModelMapper modelMapper;
//
//    @Autowired
//    FeatureManager featureManager;
//
//    @Autowired
//    UserService userService;
//
//    @Autowired
//    CategoryService categoryService;
//
//    @PostMapping("/create-wanted-item")
//    @Operation(
//            summary = "Create Wanted Item",
//            description = "Creates a new wanted item for a user and category."
//    )
//    public ResponseEntity<WantedItemResponseDTO> createWantedItem(
//            @Valid @RequestBody WantedItemRequestDTO wantedItemRequestDTO) {
//
//        if (!featureManager.isActive(CREATE_WANTED_ITEM)) {
//            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
//        }
//
//        User user = userService.findById(wantedItemRequestDTO.getUserId());
//
//        Category category = categoryService.findCategoryByName(
//                wantedItemRequestDTO.getCategoryName()
//        );
//        if (category == null) {
//            throw new ResponseStatusException(
//                    HttpStatus.BAD_REQUEST,
//                    "Category not found: " + wantedItemRequestDTO.getCategoryName()
//            );
//        }
//
//        WantedItem wantedItem = new WantedItem();
//        wantedItem.setTitle(wantedItemRequestDTO.getTitle());
//        wantedItem.setDescription(wantedItemRequestDTO.getDescription());
//        wantedItem.setUser(user);
//        wantedItem.setCategory(category);
//
//        WantedItem createdWantedItem =
//                wantedItemService.createWantedItem(wantedItem);
//
//        WantedItemResponseDTO response =
//                modelMapper.map(createdWantedItem, WantedItemResponseDTO.class);
//
//        response.setItemId(createdWantedItem.getItemId());
//        response.setUserId(createdWantedItem.getUser().getId());
//        response.setCategoryName(createdWantedItem.getCategory().getName());
//
//        return new ResponseEntity<>(response, HttpStatus.CREATED);
//    }
//
//    @GetMapping("/get-wanted-items")
//    @Operation(
//            summary = "Get All Wanted Items",
//            description = "Retrieves all wanted items."
//    )
//    public ResponseEntity<List<WantedItemResponseDTO>> getWantedItems() {
//
//        if (!featureManager.isActive(GET_ALL_WANTED_ITEMS)) {
//            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
//        }
//
//        List<WantedItem> wantedItems =
//                wantedItemService.getAllWantedItems();
//
//        List<WantedItemResponseDTO> response = wantedItems.stream()
//                .map(item -> {
//                    WantedItemResponseDTO dto =
//                            modelMapper.map(item, WantedItemResponseDTO.class);
//                    dto.setItemId(item.getItemId());
//                    dto.setUserId(item.getUser().getId());
//                    dto.setCategoryName(
//                            item.getCategory() != null
//                                    ? item.getCategory().getName()
//                                    : null
//                    );
//                    return dto;
//                })
//                .collect(Collectors.toList());
//
//        return new ResponseEntity<>(response, HttpStatus.OK);
//    }
//
//    @GetMapping("/get-wanted-items-by-user/{userId}")
//    @Operation(
//            summary = "Get Wanted Items by User",
//            description = "Retrieves wanted items posted by a specific user."
//    )
//    public ResponseEntity<List<WantedItemResponseDTO>> getWantedItemsByUser(
//            @PathVariable UUID userId) {
//
//        if (!featureManager.isActive(GET_ALL_WANTED_ITEMS_BY_USER)) {
//            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
//        }
//
//        List<WantedItem> wantedItems =
//                wantedItemService.getAllWantedItemsByUser(userId);
//
//        List<WantedItemResponseDTO> response = wantedItems.stream()
//                .map(item -> {
//                    WantedItemResponseDTO dto =
//                            modelMapper.map(item, WantedItemResponseDTO.class);
//                    dto.setItemId(item.getItemId());
//                    dto.setUserId(item.getUser().getId());
//                    dto.setCategoryName(
//                            item.getCategory() != null
//                                    ? item.getCategory().getName()
//                                    : null
//                    );
//                    return dto;
//                })
//                .collect(Collectors.toList());
//
//        return new ResponseEntity<>(response, HttpStatus.OK);
//    }
//
//    @DeleteMapping("/delete-wanted-item/{itemId}")
//    @Operation(
//            summary = "Delete Wanted Item",
//            description = "Deletes a wanted item by ID."
//    )
//    public ResponseEntity<WantedItemResponseDTO> deleteWantedItem(
//            @PathVariable UUID itemId) {
//
//        if (!featureManager.isActive(DELETE_WANTED_ITEM)) {
//            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
//        }
//
//        WantedItem wantedItem =
//                wantedItemService.deleteWantedItemById(itemId);
//
//        WantedItemResponseDTO response =
//                modelMapper.map(wantedItem, WantedItemResponseDTO.class);
//
//        response.setItemId(wantedItem.getItemId());
//        response.setUserId(wantedItem.getUser().getId());
//        response.setCategoryName(
//                wantedItem.getCategory() != null
//                        ? wantedItem.getCategory().getName()
//                        : null
//        );
//
//        return new ResponseEntity<>(response, HttpStatus.OK);
//    }
//}
