package com.foodhub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderRequest {
    private Long restaurantId;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // COD, CARD

    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;

    private String couponCode; // Optional promo/coupon
}
