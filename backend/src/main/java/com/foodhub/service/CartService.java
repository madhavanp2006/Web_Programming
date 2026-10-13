package com.foodhub.service;

import com.foodhub.dto.CartDto;
import com.foodhub.dto.CartItemDto;
import com.foodhub.entity.*;
import com.foodhub.exception.BadRequestException;
import com.foodhub.exception.ResourceNotFoundException;
import com.foodhub.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    public CartDto getCustomerCart(String username) {
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Cart cart = cartRepository.findByCustomer(customer)
                .orElseGet(() -> cartRepository.save(Cart.builder().customer(customer).build()));

        List<CartItem> items = cartItemRepository.findByCart(cart);
        List<CartItemDto> itemDtos = items.stream().map(this::mapToItemDto).collect(Collectors.toList());

        double totalAmount = itemDtos.stream()
                .mapToDouble(item -> item.getFoodItemPrice() * item.getQuantity())
                .sum();

        return CartDto.builder()
                .id(cart.getId())
                .customerId(customer.getId())
                .items(itemDtos)
                .totalAmount(totalAmount)
                .build();
    }

    @Transactional
    public CartDto addItemToCart(String username, Long foodItemId, Integer quantity) {
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        FoodItem foodItem = foodItemRepository.findById(foodItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found"));

        if (!foodItem.isAvailable()) {
            throw new BadRequestException("This food item is currently unavailable");
        }

        Cart cart = cartRepository.findByCustomer(customer)
                .orElseGet(() -> cartRepository.save(Cart.builder().customer(customer).build()));

        List<CartItem> existingItems = cartItemRepository.findByCart(cart);

        // Zomato/Swiggy constraint: only order from one restaurant at a time
        if (!existingItems.isEmpty()) {
            Long existingRestaurantId = existingItems.get(0).getFoodItem().getRestaurant().getId();
            if (!existingRestaurantId.equals(foodItem.getRestaurant().getId())) {
                throw new BadRequestException("Your cart contains items from another restaurant. Please clear your cart first.");
            }
        }

        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartAndFoodItem(cart, foodItem);

        if (existingItemOpt.isPresent()) {
            CartItem cartItem = existingItemOpt.get();
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
            cartItemRepository.save(cartItem);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .foodItem(foodItem)
                    .quantity(quantity)
                    .build();
            cartItemRepository.save(newItem);
        }

        return getCustomerCart(username);
    }

    @Transactional
    public CartDto updateItemQuantity(String username, Long foodItemId, Integer quantity) {
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Cart cart = cartRepository.findByCustomer(customer)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        FoodItem foodItem = foodItemRepository.findById(foodItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found"));

        CartItem cartItem = cartItemRepository.findByCartAndFoodItem(cart, foodItem)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found in cart"));

        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
        } else {
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
        }

        return getCustomerCart(username);
    }

    @Transactional
    public CartDto removeItemFromCart(String username, Long foodItemId) {
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Cart cart = cartRepository.findByCustomer(customer)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        FoodItem foodItem = foodItemRepository.findById(foodItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found"));

        CartItem cartItem = cartItemRepository.findByCartAndFoodItem(cart, foodItem)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found in cart"));

        cartItemRepository.delete(cartItem);
        return getCustomerCart(username);
    }

    @Transactional
    public void clearCart(Cart cart) {
        cartItemRepository.deleteByCart(cart);
    }

    @Transactional
    public CartDto clearCustomerCart(String username) {
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Cart cart = cartRepository.findByCustomer(customer)
                .orElseGet(() -> cartRepository.save(Cart.builder().customer(customer).build()));

        clearCart(cart);
        return getCustomerCart(username);
    }

    private CartItemDto mapToItemDto(CartItem item) {
        return CartItemDto.builder()
                .id(item.getId())
                .foodItemId(item.getFoodItem().getId())
                .foodItemName(item.getFoodItem().getName())
                .foodItemPrice(item.getFoodItem().getPrice())
                .foodItemImageUrl(item.getFoodItem().getImageUrl())
                .restaurantId(item.getFoodItem().getRestaurant().getId())
                .quantity(item.getQuantity())
                .build();
    }
}
