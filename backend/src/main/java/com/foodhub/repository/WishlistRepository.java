package com.foodhub.repository;

import com.foodhub.entity.Wishlist;
import com.foodhub.entity.Restaurant;
import com.foodhub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findByCustomer(User customer);
    Optional<Wishlist> findByCustomerAndRestaurant(User customer, Restaurant restaurant);
    boolean existsByCustomerAndRestaurant(User customer, Restaurant restaurant);
}
