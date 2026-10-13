package com.foodhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodItemDto {
    private Long id;
    private Long restaurantId;
    private String restaurantName;
    private Long categoryId;
    private String categoryName;
    private String name;
    private String description;
    private Double price;
    private boolean isAvailable;
    private String imageUrl;
}
