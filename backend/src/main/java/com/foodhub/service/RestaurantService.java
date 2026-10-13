package com.foodhub.service;

import com.foodhub.dto.RestaurantDto;
import com.foodhub.entity.*;
import com.foodhub.exception.BadRequestException;
import com.foodhub.exception.ResourceNotFoundException;
import com.foodhub.repository.OrderRepository;
import com.foodhub.repository.RestaurantRepository;
import com.foodhub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    // Public / Customer actions
    public List<RestaurantDto> getApprovedActiveRestaurants() {
        return restaurantRepository.findByIsApprovedTrueAndIsActiveTrue().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<RestaurantDto> searchRestaurants(String name) {
        return restaurantRepository.findByNameContainingIgnoreCase(name).stream()
                .filter(r -> r.isApproved() && r.isActive())
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public RestaurantDto getRestaurantDtoById(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with ID: " + id));
        return mapToDto(restaurant);
    }

    public Restaurant getRestaurantById(Long id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with ID: " + id));
    }

    // Owner actions
    public List<RestaurantDto> getRestaurantsByOwner(String username) {
        User owner = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));
        return restaurantRepository.findByOwner(owner).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public RestaurantDto createRestaurant(RestaurantDto dto, String username) {
        User owner = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        if (owner.getRole() != Role.OWNER) {
            throw new BadRequestException("Only users with role OWNER can register restaurants");
        }

        Restaurant restaurant = Restaurant.builder()
                .owner(owner)
                .name(dto.getName())
                .description(dto.getDescription())
                .address(dto.getAddress())
                .phone(dto.getPhone())
                .logoUrl(dto.getLogoUrl() != null ? dto.getLogoUrl() : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80")
                .isActive(true)
                .isApproved(false) // Needs Admin approval
                .build();

        Restaurant saved = restaurantRepository.save(restaurant);
        return mapToDto(saved);
    }

    @Transactional
    public RestaurantDto updateRestaurant(Long id, RestaurantDto dto, String username) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

        if (!restaurant.getOwner().getUsername().equals(username)) {
            throw new BadRequestException("You do not own this restaurant");
        }

        restaurant.setName(dto.getName());
        restaurant.setDescription(dto.getDescription());
        restaurant.setAddress(dto.getAddress());
        restaurant.setPhone(dto.getPhone());
        if (dto.getLogoUrl() != null) {
            restaurant.setLogoUrl(dto.getLogoUrl());
        }

        Restaurant saved = restaurantRepository.save(restaurant);
        return mapToDto(saved);
    }

    // Admin actions
    public List<RestaurantDto> getAllRestaurantsForAdmin() {
        return restaurantRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void approveRestaurant(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
        restaurant.setApproved(true);
        restaurantRepository.save(restaurant);
    }

    @Transactional
    public void toggleRestaurantActiveStatus(Long id, boolean active) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
        restaurant.setActive(active);
        restaurantRepository.save(restaurant);
    }

    // Dashboards
    public Map<String, Object> getOwnerDashboardStats(String username) {
        User owner = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        List<Order> ownerOrders = orderRepository.findByRestaurantOwner(owner);

        long totalOrders = ownerOrders.size();
        long pendingOrders = ownerOrders.stream().filter(o -> o.getStatus() == OrderStatus.PENDING).count();
        long deliveredOrders = ownerOrders.stream().filter(o -> o.getStatus() == OrderStatus.DELIVERED).count();
        double totalRevenue = ownerOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED && o.getPaymentStatus() == PaymentStatus.PAID)
                .mapToDouble(Order::getTotalAmount)
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", totalOrders);
        stats.put("pendingOrders", pendingOrders);
        stats.put("deliveredOrders", deliveredOrders);
        stats.put("revenue", totalRevenue);

        return stats;
    }

    public Map<String, Object> getAdminDashboardStats() {
        long totalUsers = userRepository.count();
        long totalRestaurants = restaurantRepository.count();
        List<Order> allOrders = orderRepository.findAll();

        long totalOrdersCount = allOrders.size();
        long pendingOrders = allOrders.stream().filter(o -> o.getStatus() == OrderStatus.PENDING).count();
        long deliveredOrders = allOrders.stream().filter(o -> o.getStatus() == OrderStatus.DELIVERED).count();
        double totalRevenue = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED && o.getPaymentStatus() == PaymentStatus.PAID)
                .mapToDouble(Order::getTotalAmount)
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalRestaurants", totalRestaurants);
        stats.put("totalOrders", totalOrdersCount);
        stats.put("revenue", totalRevenue);
        stats.put("pendingOrders", pendingOrders);
        stats.put("deliveredOrders", deliveredOrders);

        return stats;
    }

    private RestaurantDto mapToDto(Restaurant restaurant) {
        return RestaurantDto.builder()
                .id(restaurant.getId())
                .name(restaurant.getName())
                .description(restaurant.getDescription())
                .address(restaurant.getAddress())
                .phone(restaurant.getPhone())
                .logoUrl(restaurant.getLogoUrl())
                .isActive(restaurant.isActive())
                .isApproved(restaurant.isApproved())
                .ownerId(restaurant.getOwner().getId())
                .ownerUsername(restaurant.getOwner().getUsername())
                .build();
    }
}
