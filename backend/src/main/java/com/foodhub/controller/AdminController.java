package com.foodhub.controller;

import com.foodhub.entity.User;
import com.foodhub.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin
@RequestMapping("/api/admin/users")
public class AdminController {

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    @PostMapping("/{id}/block")
    public ResponseEntity<?> blockUser(@PathVariable Long id) {
        authService.toggleUserStatus(id, true);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User blocked successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/unblock")
    public ResponseEntity<?> unblockUser(@PathVariable Long id) {
        authService.toggleUserStatus(id, false);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User unblocked successfully");
        return ResponseEntity.ok(response);
    }
}
