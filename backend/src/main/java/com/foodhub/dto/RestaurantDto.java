package com.foodhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantDto {
    private Long id;
    private String name;
    private String description;
    private String address;
    private String phone;
    private String logoUrl;
    private boolean isActive;
    private boolean isApproved;
    private Long ownerId;
    private String ownerUsername;
}
