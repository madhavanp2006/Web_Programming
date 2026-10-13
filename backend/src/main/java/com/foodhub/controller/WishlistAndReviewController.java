package com.foodhub.controller;

import com.foodhub.dto.ReviewDto;
import com.foodhub.entity.Restaurant;
import com.foodhub.service.WishlistAndReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin
public class WishlistAndReviewController {

    @Autowired
    private WishlistAndReviewService wishlistAndReviewService;

    // Wishlist Endpoints
    @GetMapping("/api/customer/wishlist")
    public ResponseEntity<List<com.foodhub.dto.RestaurantDto>> getWishlist(Authentication authentication) {
        return ResponseEntity.ok(wishlistAndReviewService.getCustomerWishlist(authentication.getName()));
    }

    @PostMapping("/api/customer/wishlist/add/{restaurantId}")
    public ResponseEntity<?> addToWishlist(Authentication authentication, @PathVariable Long restaurantId) {
        wishlistAndReviewService.addRestaurantToWishlist(authentication.getName(), restaurantId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Restaurant added to wishlist");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/api/customer/wishlist/remove/{restaurantId}")
    public ResponseEntity<?> removeFromWishlist(Authentication authentication, @PathVariable Long restaurantId) {
        wishlistAndReviewService.removeRestaurantFromWishlist(authentication.getName(), restaurantId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Restaurant removed from wishlist");
        return ResponseEntity.ok(response);
    }

    // Review Endpoints (Customer submit)
    @PostMapping("/api/customer/reviews")
    public ResponseEntity<ReviewDto> addReview(
            Authentication authentication,
            @RequestParam Long foodItemId,
            @RequestParam Integer rating,
            @RequestParam String comment) {
        return ResponseEntity.ok(wishlistAndReviewService.addReview(authentication.getName(), foodItemId, rating, comment));
    }

    // Review Endpoints (Public views)
    @GetMapping("/api/public/reviews/food-item/{foodItemId}")
    public ResponseEntity<List<ReviewDto>> getReviewsForFoodItem(@PathVariable Long foodItemId) {
        return ResponseEntity.ok(wishlistAndReviewService.getReviewsForFoodItem(foodItemId));
    }

    @GetMapping("/api/public/reviews/restaurant/{restaurantId}")
    public ResponseEntity<List<ReviewDto>> getReviewsForRestaurant(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(wishlistAndReviewService.getReviewsForRestaurant(restaurantId));
    }
}
