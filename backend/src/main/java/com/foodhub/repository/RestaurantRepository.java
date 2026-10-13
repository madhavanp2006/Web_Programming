package com.foodhub.repository;

import com.foodhub.entity.Restaurant;
import com.foodhub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    List<Restaurant> findByOwner(User owner);
    List<Restaurant> findByIsApprovedTrueAndIsActiveTrue();
    List<Restaurant> findByIsApprovedFalse();
    List<Restaurant> findByNameContainingIgnoreCase(String name);
}
