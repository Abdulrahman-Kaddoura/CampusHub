package com.campushub.backend.configurations;

import com.campushub.backend.models.listings.Category;
import com.campushub.backend.repositories.listing.CategoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private static final List<String> DEFAULT_CATEGORIES = List.of(
            "Electronics & Gadgets",
            "Books, Study & Office Supplies",
            "Furniture & Home Goods",
            "Clothing & Accessories",
            "Sports & Fitness",
            "Food & Groceries",
            "Beauty & Personal Care",
            "Tools & DIY",
            "Musical Instruments & Gear",
            "Games & Entertainment",
            "Pet Supplies",
            "Other"
    );

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public void run(String... args) {
        for (String name : DEFAULT_CATEGORIES) {
            if (categoryRepository.findByName(name).isEmpty()) {
                Category category = new Category();
                category.setName(name);
                categoryRepository.save(category);
                log.info("Seeded category: {}", name);
            }
        }
    }
}
