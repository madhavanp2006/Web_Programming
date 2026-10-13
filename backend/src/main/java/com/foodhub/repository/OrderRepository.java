package com.foodhub.repository;

import com.foodhub.entity.Order;
import com.foodhub.entity.Restaurant;
import com.foodhub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomer(User customer);
    List<Order> findByRestaurant(Restaurant restaurant);

    @Query("SELECT o FROM Order o WHERE o.restaurant.owner = :owner")
    List<Order> findByRestaurantOwner(@Param("owner") User owner);
}
