package com.foodhub.controller;

import com.foodhub.dto.CartDto;
import com.foodhub.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin
@RequestMapping("/api/customer/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    public ResponseEntity<CartDto> getCart(Authentication authentication) {
        return ResponseEntity.ok(cartService.getCustomerCart(authentication.getName()));
    }

    @PostMapping("/add")
    public ResponseEntity<CartDto> addToCart(
            Authentication authentication,
            @RequestParam(required = false) Long foodItemId,
            @RequestParam(defaultValue = "1") Integer quantity,
            @RequestBody(required = false) Map<String, Object> body) {
        
        Long id = foodItemId;
        Integer qty = quantity;
        
        if (id == null && body != null) {
            if (body.containsKey("foodItemId")) {
                id = Long.valueOf(body.get("foodItemId").toString());
            }
            if (body.containsKey("quantity")) {
                qty = Integer.valueOf(body.get("quantity").toString());
            }
        }
        
        return ResponseEntity.ok(cartService.addItemToCart(authentication.getName(), id, qty));
    }

    @PutMapping("/update")
    public ResponseEntity<CartDto> updateQuantity(
            Authentication authentication,
            @RequestParam(required = false) Long foodItemId,
            @RequestParam(required = false) Integer quantity,
            @RequestBody(required = false) Map<String, Object> body) {
        
        Long id = foodItemId;
        Integer qty = quantity;
        
        if (id == null && body != null) {
            if (body.containsKey("foodItemId")) {
                id = Long.valueOf(body.get("foodItemId").toString());
            }
            if (body.containsKey("quantity")) {
                qty = Integer.valueOf(body.get("quantity").toString());
            }
        }
        
        return ResponseEntity.ok(cartService.updateItemQuantity(authentication.getName(), id, qty));
    }

    @DeleteMapping("/remove/{foodItemId}")
    public ResponseEntity<CartDto> removeFromCart(
            Authentication authentication,
            @PathVariable Long foodItemId) {
        return ResponseEntity.ok(cartService.removeItemFromCart(authentication.getName(), foodItemId));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(Authentication authentication) {
        CartDto cart = cartService.clearCustomerCart(authentication.getName());
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Cart cleared successfully");
        response.put("cart", cart);
        return ResponseEntity.ok(response);
    }
}
