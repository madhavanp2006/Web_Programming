package com.foodhub.controller;

import com.foodhub.dto.RestaurantDto;
import com.foodhub.service.RestaurantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    // Public restaurant views
    @GetMapping("/api/public/restaurants")
    public ResponseEntity<List<RestaurantDto>> getApprovedActiveRestaurants() {
        return ResponseEntity.ok(restaurantService.getApprovedActiveRestaurants());
    }

    @GetMapping("/api/public/restaurants/search")
    public ResponseEntity<List<RestaurantDto>> searchRestaurants(@RequestParam String name) {
        return ResponseEntity.ok(restaurantService.searchRestaurants(name));
    }

    @GetMapping("/api/public/restaurants/{id}")
    public ResponseEntity<RestaurantDto> getRestaurantById(@PathVariable Long id) {
        return ResponseEntity.ok(restaurantService.getRestaurantDtoById(id));
    }

    // Owner management actions
    @GetMapping("/api/owner/restaurants")
    public ResponseEntity<List<RestaurantDto>> getRestaurantsByOwner(Authentication authentication) {
        return ResponseEntity.ok(restaurantService.getRestaurantsByOwner(authentication.getName()));
    }

    @PostMapping("/api/owner/restaurants")
    public ResponseEntity<RestaurantDto> createRestaurant(Authentication authentication, @RequestBody RestaurantDto dto) {
        return ResponseEntity.ok(restaurantService.createRestaurant(dto, authentication.getName()));
    }

    @PutMapping("/api/owner/restaurants/{id}")
    public ResponseEntity<RestaurantDto> updateRestaurant(Authentication authentication, @PathVariable Long id, @RequestBody RestaurantDto dto) {
        return ResponseEntity.ok(restaurantService.updateRestaurant(id, dto, authentication.getName()));
    }

    @GetMapping("/api/owner/restaurants/dashboard")
    public ResponseEntity<Map<String, Object>> getOwnerDashboardStats(Authentication authentication) {
        return ResponseEntity.ok(restaurantService.getOwnerDashboardStats(authentication.getName()));
    }

    // Admin management actions
    @GetMapping("/api/admin/restaurants")
    public ResponseEntity<List<RestaurantDto>> getAllRestaurantsForAdmin() {
        return ResponseEntity.ok(restaurantService.getAllRestaurantsForAdmin());
    }

    @PostMapping("/api/admin/restaurants/{id}/approve")
    public ResponseEntity<?> approveRestaurant(@PathVariable Long id) {
        restaurantService.approveRestaurant(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Restaurant approved successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/admin/restaurants/{id}/block")
    public ResponseEntity<?> blockRestaurant(@PathVariable Long id) {
        restaurantService.toggleRestaurantActiveStatus(id, false);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Restaurant blocked successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/admin/restaurants/{id}/unblock")
    public ResponseEntity<?> unblockRestaurant(@PathVariable Long id) {
        restaurantService.toggleRestaurantActiveStatus(id, true);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Restaurant unblocked successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/admin/restaurants/dashboard")
    public ResponseEntity<Map<String, Object>> getAdminDashboardStats() {
        return ResponseEntity.ok(restaurantService.getAdminDashboardStats());
    }
}
