package com.foodhub.controller;

import com.foodhub.dto.OrderRequest;
import com.foodhub.dto.OrderResponse;
import com.foodhub.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin
public class OrderController {

    @Autowired
    private OrderService orderService;

    // Customer Order Endpoints
    @PostMapping({"/api/customer/orders", "/api/customer/orders/create"})
    public ResponseEntity<OrderResponse> placeOrder(Authentication authentication, @Valid @RequestBody OrderRequest request) {
        return ResponseEntity.ok(orderService.placeOrder(authentication.getName(), request));
    }

    @GetMapping("/api/customer/orders")
    public ResponseEntity<List<OrderResponse>> getCustomerOrders(Authentication authentication) {
        return ResponseEntity.ok(orderService.getCustomerOrders(authentication.getName()));
    }

    @GetMapping("/api/customer/orders/{id}")
    public ResponseEntity<OrderResponse> getCustomerOrderDetails(Authentication authentication, @PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderDetails(id, authentication.getName()));
    }

    @PostMapping("/api/customer/orders/{id}/cancel")
    public ResponseEntity<?> cancelOrder(Authentication authentication, @PathVariable Long id) {
        OrderResponse cancelled = orderService.cancelOrder(id, authentication.getName());
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Order cancelled successfully");
        response.put("order", cancelled);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/customer/orders/{id}/invoice")
    public ResponseEntity<Map<String, Object>> getInvoice(Authentication authentication, @PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderInvoice(id, authentication.getName()));
    }

    // Owner Order Endpoints
    @GetMapping("/api/owner/orders/restaurant/{restaurantId}")
    public ResponseEntity<List<OrderResponse>> getRestaurantOrders(
            Authentication authentication,
            @PathVariable Long restaurantId) {
        return ResponseEntity.ok(orderService.getRestaurantOrders(restaurantId, authentication.getName()));
    }

    @PutMapping("/api/owner/orders/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateOrderStatusByOwner(id, status, authentication.getName()));
    }

    // Admin Order Endpoints
    @GetMapping("/api/admin/orders")
    public ResponseEntity<List<OrderResponse>> getAllOrdersForAdmin() {
        return ResponseEntity.ok(orderService.getAllOrdersForAdmin());
    }
}
