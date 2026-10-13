package com.foodhub.repository;

import com.foodhub.entity.Cart;
import com.foodhub.entity.CartItem;
import com.foodhub.entity.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByCart(Cart cart);
    Optional<CartItem> findByCartAndFoodItem(Cart cart, FoodItem foodItem);
    void deleteByCart(Cart cart);
}
