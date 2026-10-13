package com.foodhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemDto {
    private Long id;
    private Long foodItemId;
    private String foodItemName;
    private Double foodItemPrice;
    private String foodItemImageUrl;
    private Long restaurantId;
    private Integer quantity;
}
