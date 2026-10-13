package com.foodhub.repository;

import com.foodhub.entity.Category;
import com.foodhub.entity.FoodItem;
import com.foodhub.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {
    List<FoodItem> findByRestaurant(Restaurant restaurant);
    List<FoodItem> findByRestaurantAndIsAvailableTrue(Restaurant restaurant);
    List<FoodItem> findByCategory(Category category);
    List<FoodItem> findByNameContainingIgnoreCase(String name);
    List<FoodItem> findByRestaurantAndCategory(Restaurant restaurant, Category category);
    List<FoodItem> findByRestaurantAndCategoryAndIsAvailableTrue(Restaurant restaurant, Category category);

    List<FoodItem> findByIsAvailableTrue();
}
