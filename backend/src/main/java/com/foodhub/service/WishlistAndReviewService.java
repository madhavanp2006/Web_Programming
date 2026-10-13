package com.foodhub.service;

import com.foodhub.dto.ReviewDto;
import com.foodhub.entity.*;
import com.foodhub.exception.BadRequestException;
import com.foodhub.exception.ResourceNotFoundException;
import com.foodhub.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WishlistAndReviewService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    // Wishlist actions
    public List<com.foodhub.dto.RestaurantDto> getCustomerWishlist(String username) {
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return wishlistRepository.findByCustomer(customer).stream()
                .map(w -> mapToRestaurantDto(w.getRestaurant()))
                .collect(Collectors.toList());
    }

    private com.foodhub.dto.RestaurantDto mapToRestaurantDto(Restaurant r) {
        return com.foodhub.dto.RestaurantDto.builder()
                .id(r.getId())
                .name(r.getName())
                .description(r.getDescription())
                .address(r.getAddress())
                .phone(r.getPhone())
                .logoUrl(r.getLogoUrl())
                .isActive(r.isActive())
                .isApproved(r.isApproved())
                .ownerId(r.getOwner() != null ? r.getOwner().getId() : null)
                .ownerUsername(r.getOwner() != null ? r.getOwner().getUsername() : null)
                .build();
    }

    @Transactional
    public void addRestaurantToWishlist(String username, Long restaurantId) {
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

        if (!wishlistRepository.existsByCustomerAndRestaurant(customer, restaurant)) {
            Wishlist wishlist = Wishlist.builder()
                    .customer(customer)
                    .restaurant(restaurant)
                    .build();
            wishlistRepository.save(wishlist);
        }
    }

    @Transactional
    public void removeRestaurantFromWishlist(String username, Long restaurantId) {
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

        wishlistRepository.findByCustomerAndRestaurant(customer, restaurant)
                .ifPresent(wishlistRepository::delete);
    }

    // Review actions
    @Transactional
    public ReviewDto addReview(String username, Long foodItemId, Integer rating, String comment) {
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        FoodItem foodItem = foodItemRepository.findById(foodItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found"));

        if (rating < 1 || rating > 5) {
            throw new BadRequestException("Rating must be between 1 and 5");
        }

        Review review = Review.builder()
                .customer(customer)
                .foodItem(foodItem)
                .rating(rating)
                .comment(comment)
                .build();

        Review saved = reviewRepository.save(review);
        return mapToReviewDto(saved);
    }

    public List<ReviewDto> getReviewsForFoodItem(Long foodItemId) {
        FoodItem foodItem = foodItemRepository.findById(foodItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found"));
        return reviewRepository.findByFoodItem(foodItem).stream()
                .map(this::mapToReviewDto)
                .collect(Collectors.toList());
    }

    public List<ReviewDto> getReviewsForRestaurant(Long restaurantId) {
        return reviewRepository.findByRestaurantId(restaurantId).stream()
                .map(this::mapToReviewDto)
                .collect(Collectors.toList());
    }

    private ReviewDto mapToReviewDto(Review review) {
        return ReviewDto.builder()
                .id(review.getId())
                .customerId(review.getCustomer().getId())
                .customerUsername(review.getCustomer().getUsername())
                .foodItemId(review.getFoodItem().getId())
                .foodItemName(review.getFoodItem().getName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
