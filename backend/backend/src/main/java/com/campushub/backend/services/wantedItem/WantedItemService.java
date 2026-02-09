//package com.campushub.backend.services.wantedItem;
//
//import com.campushub.backend.exceptions.category.CategoryNullOrBlankException;
//import com.campushub.backend.exceptions.user.UserNullException;
//import com.campushub.backend.exceptions.wantedItem.WantedItemNotFoundException;
//import com.campushub.backend.models.wanteditems.WantedItem;
//import com.campushub.backend.repositories.wantedItem.WantedItemRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//import java.util.UUID;
//
//@Service
//public class WantedItemService {
//
//    @Autowired
//    WantedItemRepository wantedItemRepository;
//
//    public WantedItem createWantedItem(WantedItem wantedItem) {
//        return wantedItemRepository.save(wantedItem);
//    }
//
//    public List<WantedItem> getAllWantedItems() {
//        return wantedItemRepository.findAll();
//    }
//
//    public List<WantedItem> getAllWantedItemsByUser(UUID userId) {
//        if (userId == null) {
//            throw new UserNullException("User ID must not be null");
//        }
//        return wantedItemRepository.findByUserId(userId);
//    }
//
//    public List<WantedItem> getAllWantedItemsByCategory(String categoryName) {
//        if (categoryName == null || categoryName.isBlank()) {
//            throw new CategoryNullOrBlankException("Category name must not be empty");
//        }
//        return wantedItemRepository.findByCategoryName(categoryName);
//    }
//
//    public WantedItem deleteWantedItemById(UUID itemId) {
//        WantedItem wantedItem = wantedItemRepository.findById(itemId)
//                .orElseThrow(() ->
//                        new WantedItemNotFoundException("Wanted item not found with id: " + itemId)
//                );
//        wantedItemRepository.delete(wantedItem);
//        return wantedItem;
//    }
//}
