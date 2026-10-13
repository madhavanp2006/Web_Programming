package com.foodhub.service;

import com.foodhub.dto.*;
import com.foodhub.entity.*;
import com.foodhub.exception.BadRequestException;
import com.foodhub.exception.ResourceNotFoundException;
import com.foodhub.repository.CartRepository;
import com.foodhub.repository.UserRepository;
import com.foodhub.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private final Random random = new Random();

    @Transactional
    public User registerUser(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        Role role;
        try {
            role = Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role. Role must be CUSTOMER, OWNER, or ADMIN");
        }

        // Generate registration OTP
        String otp = String.format("%06d", random.nextInt(999999));

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .address(request.getAddress())
                .role(role)
                .status(UserStatus.ACTIVE)
                .otp(otp)
                .otpExpiry(LocalDateTime.now().plusHours(24))
                .emailVerified(true)
                .build();

        User savedUser = userRepository.save(user);

        // MOCK EMAIL LOGGING
        System.out.println("==================================================");
        System.out.println("FoodHub - REGISTRATION EMAIL OTP FOR: " + savedUser.getEmail());
        System.out.println("OTP CODE: " + otp);
        System.out.println("==================================================");
        writeOtpToFile(savedUser.getEmail(), otp, "REGISTRATION");

        // If the user is a CUSTOMER, auto-create their empty Cart
        if (role == Role.CUSTOMER) {
            Cart cart = Cart.builder()
                    .customer(savedUser)
                    .build();
            cartRepository.save(cart);
        }

        return savedUser;
    }

    public LoginResponse authenticateUser(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + request.getUsername()));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid username or password");
        }

        if (user.getRole() == Role.CUSTOMER && !user.isEmailVerified()) {
            throw new BadRequestException("Email not verified. Please verify your email first.");
        }

        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new BadRequestException("Your account has been blocked. Contact administrator.");
        }

        String token = jwtTokenProvider.generateToken(user.getUsername(), user.getRole().name());

        return LoginResponse.builder()
                .token(token)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .build();
    }

    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("Incorrect old password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public void initiateForgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No user found with email: " + request.getEmail()));

        // Generate 6-digit OTP
        String otp = String.format("%06d", random.nextInt(999999));
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10)); // 10 minutes validity
        userRepository.save(user);

        // MOCK EMAIL LOGGING
        System.out.println("==================================================");
        System.out.println("FoodHub - PASSWORD RESET OTP FOR: " + user.getEmail());
        System.out.println("OTP CODE: " + otp);
        System.out.println("==================================================");
        writeOtpToFile(user.getEmail(), otp, "PASSWORD RESET");
    }

    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No user found with email: " + request.getEmail()));

        if (user.getOtp() == null || !user.getOtp().equals(request.getOtp())) {
            throw new BadRequestException("Invalid OTP code");
        }

        if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP code has expired");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
    }

    public void initiateOtpLogin(String emailOrPhone) {
        Optional<User> userOpt = userRepository.findByEmail(emailOrPhone);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByUsername(emailOrPhone);
        }
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findAll().stream()
                    .filter(u -> emailOrPhone.equals(u.getPhone()))
                    .findFirst();
        }

        User user = userOpt.orElseThrow(() -> new ResourceNotFoundException("No user registered with details: " + emailOrPhone));

        // Generate OTP
        String otp = String.format("%06d", random.nextInt(999999));
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        // MOCK OTP LOGGING
        System.out.println("==================================================");
        System.out.println("FoodHub - OTP LOGIN CODE FOR: " + user.getUsername());
        System.out.println("OTP CODE: " + otp);
        System.out.println("==================================================");
        writeOtpToFile(user.getUsername(), otp, "OTP LOGIN");
    }

    public LoginResponse verifyOtpLogin(String emailOrPhone, String otp) {
        Optional<User> userOpt = userRepository.findByEmail(emailOrPhone);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByUsername(emailOrPhone);
        }
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findAll().stream()
                    .filter(u -> emailOrPhone.equals(u.getPhone()))
                    .findFirst();
        }

        User user = userOpt.orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            throw new BadRequestException("Invalid OTP code");
        }

        if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP code has expired");
        }

        // Verify status
        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new BadRequestException("Your account is blocked.");
        }

        // Clear OTP
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getUsername(), user.getRole().name());

        return LoginResponse.builder()
                .token(token)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .build();
    }

    public User getProfile(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public User updateProfile(String username, User updateData) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setPhone(updateData.getPhone());
        user.setAddress(updateData.getAddress());
        if (updateData.getEmail() != null && !updateData.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(updateData.getEmail())) {
                throw new BadRequestException("Email is already in use");
            }
            user.setEmail(updateData.getEmail());
        }

        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public void toggleUserStatus(Long userId, boolean block) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        
        if (user.getRole() == Role.ADMIN) {
            throw new BadRequestException("Cannot block/unblock other administrators");
        }

        user.setStatus(block ? UserStatus.BLOCKED : UserStatus.ACTIVE);
        userRepository.save(user);
    }

    @Transactional
    public void verifyEmail(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No user found with email: " + email));

        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            throw new BadRequestException("Invalid OTP code");
        }

        if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP code has expired");
        }

        user.setEmailVerified(true);
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
    }

    private void writeOtpToFile(String emailOrUsername, String otp, String type) {
        try {
            java.io.File file = new java.io.File("c:/Users/madhavan/OneDrive/Desktop/internship_projecr/otp.txt");
            java.io.FileWriter fw = new java.io.FileWriter(file, true);
            java.io.BufferedWriter bw = new java.io.BufferedWriter(fw);
            java.io.PrintWriter out = new java.io.PrintWriter(bw);
            out.println("[" + java.time.LocalDateTime.now() + "] " + type + " OTP for " + emailOrUsername + " is: " + otp);
            out.close();
        } catch (Exception e) {
            System.err.println("Could not write OTP to file: " + e.getMessage());
        }
    }
}
