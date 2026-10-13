package com.foodhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDto {
    private Long id;
    private Long customerId;
    private String customerUsername;
    private Long foodItemId;
    private String foodItemName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
