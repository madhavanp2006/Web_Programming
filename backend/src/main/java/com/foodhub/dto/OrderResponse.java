package com.foodhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {
    private Long id;
    private Long customerId;
    private String customerUsername;
    private Long restaurantId;
    private String restaurantName;
    private String status;
    private Double totalAmount;
    private String paymentMethod;
    private String paymentStatus;
    private String deliveryAddress;
    private List<OrderItemDto> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
