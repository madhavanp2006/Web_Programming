package com.foodhub.controller;

import com.foodhub.dto.FoodItemDto;
import com.foodhub.service.FoodItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin
public class FoodItemController {

    @Autowired
    private FoodItemService foodItemService;

    // Public / Customer Endpoints
    @GetMapping("/api/public/food-items/restaurant/{restaurantId}")
    public ResponseEntity<List<FoodItemDto>> getFoodItemsByRestaurant(
            @PathVariable Long restaurantId,
            @RequestParam(required = false) Long categoryId) {
        return ResponseEntity.ok(foodItemService.getAvailableFoodItemsByRestaurant(restaurantId, categoryId));
    }

    @GetMapping("/api/public/food-items/{id}")
    public ResponseEntity<FoodItemDto> getFoodItemById(@PathVariable Long id) {
        return ResponseEntity.ok(foodItemService.getFoodItemDtoById(id));
    }

    @GetMapping("/api/public/food-items/search")
    public ResponseEntity<List<FoodItemDto>> searchFoodItems(@RequestParam String query) {
        return ResponseEntity.ok(foodItemService.searchFoodItems(query));
    }

    @GetMapping("/api/public/food-items/recommendations")
    public ResponseEntity<List<FoodItemDto>> getFoodRecommendations() {
        return ResponseEntity.ok(foodItemService.getFoodRecommendations());
    }

    // Owner Endpoints
    @GetMapping("/api/owner/food-items/restaurant/{restaurantId}")
    public ResponseEntity<List<FoodItemDto>> getFoodItemsByRestaurantForOwner(
            Authentication authentication,
            @PathVariable Long restaurantId) {
        return ResponseEntity.ok(foodItemService.getFoodItemsByRestaurantForOwner(restaurantId, authentication.getName()));
    }

    @PostMapping("/api/owner/food-items")
    public ResponseEntity<FoodItemDto> createFoodItem(Authentication authentication, @RequestBody FoodItemDto dto) {
        return ResponseEntity.ok(foodItemService.createFoodItem(dto, authentication.getName()));
    }

    @PutMapping("/api/owner/food-items/{id}")
    public ResponseEntity<FoodItemDto> updateFoodItem(Authentication authentication, @PathVariable Long id, @RequestBody FoodItemDto dto) {
        return ResponseEntity.ok(foodItemService.updateFoodItem(id, dto, authentication.getName()));
    }

    @DeleteMapping("/api/owner/food-items/{id}")
    public ResponseEntity<?> deleteFoodItem(Authentication authentication, @PathVariable Long id) {
        foodItemService.deleteFoodItem(id, authentication.getName());
        Map<String, String> response = new HashMap<>();
        response.put("message", "Food item deleted successfully");
        return ResponseEntity.ok(response);
    }
}
