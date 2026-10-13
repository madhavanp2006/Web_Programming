package com.foodhub.service;

import com.foodhub.dto.FoodItemDto;
import com.foodhub.entity.Category;
import com.foodhub.entity.FoodItem;
import com.foodhub.entity.Restaurant;
import com.foodhub.exception.BadRequestException;
import com.foodhub.exception.ResourceNotFoundException;
import com.foodhub.repository.CategoryRepository;
import com.foodhub.repository.FoodItemRepository;
import com.foodhub.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FoodItemService {

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    // Public / Customer Actions
    public List<FoodItemDto> getAvailableFoodItemsByRestaurant(Long restaurantId, Long categoryId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

        List<FoodItem> items;
        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            items = foodItemRepository.findByRestaurantAndCategoryAndIsAvailableTrue(restaurant, category);
        } else {
            items = foodItemRepository.findByRestaurantAndIsAvailableTrue(restaurant);
        }

        return items.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public FoodItemDto getFoodItemDtoById(Long id) {
        FoodItem item = foodItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with ID: " + id));
        return mapToDto(item);
    }

    public FoodItem getFoodItemById(Long id) {
        return foodItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with ID: " + id));
    }

    public List<FoodItemDto> searchFoodItems(String query) {
        return foodItemRepository.findByNameContainingIgnoreCase(query).stream()
                .filter(item -> item.isAvailable() && item.getRestaurant().isApproved() && item.getRestaurant().isActive())
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // Recommendations (Database agnostic, shuffles and returns 6 items)
    public List<FoodItemDto> getFoodRecommendations() {
        List<FoodItem> available = foodItemRepository.findByIsAvailableTrue().stream()
                .filter(item -> item.getRestaurant().isApproved() && item.getRestaurant().isActive())
                .collect(Collectors.toList());

        Collections.shuffle(available);
        return available.stream()
                .limit(6)
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // Owner CRUD Actions
    @Transactional
    public FoodItemDto createFoodItem(FoodItemDto dto, String username) {
        Restaurant restaurant = restaurantRepository.findById(dto.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

        if (!restaurant.getOwner().getUsername().equals(username)) {
            throw new BadRequestException("You are not the owner of this restaurant");
        }

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        FoodItem item = FoodItem.builder()
                .restaurant(restaurant)
                .category(category)
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .isAvailable(true)
                .imageUrl(dto.getImageUrl() != null ? dto.getImageUrl() : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80")
                .build();

        FoodItem saved = foodItemRepository.save(item);
        return mapToDto(saved);
    }

    @Transactional
    public FoodItemDto updateFoodItem(Long id, FoodItemDto dto, String username) {
        FoodItem item = foodItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found"));

        if (!item.getRestaurant().getOwner().getUsername().equals(username)) {
            throw new BadRequestException("You do not own the restaurant offering this food item");
        }

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        item.setName(dto.getName());
        item.setDescription(dto.getDescription());
        item.setPrice(dto.getPrice());
        item.setAvailable(dto.isAvailable());
        item.setCategory(category);
        if (dto.getImageUrl() != null) {
            item.setImageUrl(dto.getImageUrl());
        }

        FoodItem saved = foodItemRepository.save(item);
        return mapToDto(saved);
    }

    @Transactional
    public void deleteFoodItem(Long id, String username) {
        FoodItem item = foodItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found"));

        if (!item.getRestaurant().getOwner().getUsername().equals(username)) {
            throw new BadRequestException("You do not own the restaurant offering this food item");
        }

        foodItemRepository.delete(item);
    }

    public List<FoodItemDto> getFoodItemsByRestaurantForOwner(Long restaurantId, String username) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

        if (!restaurant.getOwner().getUsername().equals(username)) {
            throw new BadRequestException("You do not own this restaurant");
        }

        return foodItemRepository.findByRestaurant(restaurant).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private FoodItemDto mapToDto(FoodItem item) {
        return FoodItemDto.builder()
                .id(item.getId())
                .restaurantId(item.getRestaurant().getId())
                .restaurantName(item.getRestaurant().getName())
                .categoryId(item.getCategory().getId())
                .categoryName(item.getCategory().getName())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .isAvailable(item.isAvailable())
                .imageUrl(item.getImageUrl())
                .build();
    }
}
