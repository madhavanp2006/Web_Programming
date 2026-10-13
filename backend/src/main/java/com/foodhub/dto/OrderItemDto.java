package com.foodhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemDto {
    private Long id;
    private Long foodItemId;
    private String foodItemName;
    private String foodItemImageUrl;
    private Integer quantity;
    private Double price;
}
