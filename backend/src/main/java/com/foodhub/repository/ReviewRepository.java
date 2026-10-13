package com.foodhub.repository;

import com.foodhub.entity.Review;
import com.foodhub.entity.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByFoodItem(FoodItem foodItem);

    @Query("SELECT r FROM Review r WHERE r.foodItem.restaurant.id = :restaurantId")
    List<Review> findByRestaurantId(@Param("restaurantId") Long restaurantId);
}
