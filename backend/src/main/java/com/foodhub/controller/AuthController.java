package com.foodhub.controller;

import com.foodhub.dto.*;
import com.foodhub.entity.User;
import com.foodhub.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin
public class AuthController {

    @Autowired
    private AuthService authService;

    // Public authentication endpoints
    @PostMapping("/api/auth/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        User user = authService.registerUser(request);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "User registered successfully");
        response.put("userId", user.getId());
        response.put("role", user.getRole().name());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/auth/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.authenticateUser(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/auth/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String email, @RequestParam String otp) {
        authService.verifyEmail(email, otp);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Email verified successfully!");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/auth/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.initiateForgotPassword(request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "OTP sent to your email (check console output)");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/auth/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password has been reset successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/auth/otp/send")
    public ResponseEntity<?> sendOtp(@RequestParam String emailOrPhone) {
        authService.initiateOtpLogin(emailOrPhone);
        Map<String, String> response = new HashMap<>();
        response.put("message", "OTP code sent successfully (check console output)");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/auth/otp/verify")
    public ResponseEntity<?> verifyOtp(@RequestParam String emailOrPhone, @RequestParam String otp) {
        LoginResponse response = authService.verifyOtpLogin(emailOrPhone, otp);
        return ResponseEntity.ok(response);
    }

    // Authenticated profile management endpoints (requires valid JWT token for any role)
    @GetMapping("/api/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        String username = authentication.getName();
        User user = authService.getProfile(username);
        // Map entity to safe profile response
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("username", user.getUsername());
        profile.put("email", user.getEmail());
        profile.put("phone", user.getPhone());
        profile.put("address", user.getAddress());
        profile.put("role", user.getRole().name());
        profile.put("emailVerified", user.isEmailVerified());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/api/profile")
    public ResponseEntity<?> updateProfile(Authentication authentication, @RequestBody User updateData) {
        String username = authentication.getName();
        User user = authService.updateProfile(username, updateData);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Profile updated successfully");
        response.put("phone", user.getPhone());
        response.put("address", user.getAddress());
        response.put("email", user.getEmail());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/api/profile/change-password")
    public ResponseEntity<?> changePassword(Authentication authentication, @Valid @RequestBody ChangePasswordRequest request) {
        String username = authentication.getName();
        authService.changePassword(username, request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password changed successfully");
        return ResponseEntity.ok(response);
    }
}
