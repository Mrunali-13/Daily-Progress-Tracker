package com.enterprise.todo.auth.controller;

import com.enterprise.todo.auth.dto.AuthenticationRequest;
import com.enterprise.todo.auth.dto.AuthenticationResponse;
import com.enterprise.todo.auth.service.OtpService;
import com.enterprise.todo.config.JwtUtil;
import com.enterprise.todo.exception.ApiException;
import com.enterprise.todo.user.entity.Role;
import com.enterprise.todo.user.entity.User;
import com.enterprise.todo.user.service.UserService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.enterprise.todo.user.dto.UserDto;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;

    // Login Step 1: Password Validation and OTP Generation
    @PostMapping("/login")
    public ResponseEntity<String> authenticate(@RequestBody AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()));

        User user = (User) userService.loadUserByUsername(request.getUsername());
        if (user.getEmail() == null || user.getEmail().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Email not found for this user. Please register with an email or update your profile.");
        }
        otpService.generateOtp(user.getEmail());

        return ResponseEntity.ok("OTP sent to your registered email: " + user.getEmail());
    }

    // Login Step 2: OTP Verification and JWT Issuance
    @PostMapping("/verify-otp")
    public ResponseEntity<AuthenticationResponse> verifyOtp(@RequestBody AuthenticationRequest request) {
        User user = (User) userService.loadUserByUsername(request.getUsername());

        boolean isValid = otpService.validateOtp(user.getEmail(), request.getOtp());
        if (!isValid) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Invalid or expired OTP");
        }

        otpService.clearOtp(user.getEmail());
        final var jwt = jwtUtil.generateToken(user);
        return ResponseEntity.ok(AuthenticationResponse.builder().token(jwt).build());
    }

    // Forgot Password Step 1: Send OTP
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        User user = userService.loadUserByEmail(email);
        otpService.generateOtp(user.getEmail());
        return ResponseEntity.ok("OTP sent to your email for password reset");
    }

    // Forgot Password Step 2: Reset Password
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody AuthenticationRequest request) {
        User user = userService.loadUserByEmail(request.getEmail());

        boolean isValid = otpService.validateOtp(user.getEmail(), request.getOtp());
        if (!isValid) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Invalid or expired OTP");
        }

        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userService.saveUser(user);
        otpService.clearOtp(user.getEmail());

        return ResponseEntity.ok("Password reset successfully");
    }

    @GetMapping("/managers")
    public ResponseEntity<List<UserDto>> getManagers() {
        return ResponseEntity.ok(userService.getUsersByRole(Role.REPORTING_MANAGER).stream()
                .map(u -> UserDto.builder()
                        .id(u.getId())
                        .username(u.getUsername())
                        .role(u.getRole())
                        .build())
                .collect(Collectors.toList()));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String email = request.get("email");
        String password = request.get("password");
        String roleStr = request.getOrDefault("role", "USER");
        String managerIdStr = request.get("managerId");

        if (email == null || email.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        Role role;
        try {
            role = Role.valueOf(roleStr);
        } catch (IllegalArgumentException e) {
            role = Role.USER;
        }

        var userBuilder = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(role);

        if (managerIdStr != null && !managerIdStr.isEmpty()) {
            User manager = userService.getUserById(Long.parseLong(managerIdStr));
            userBuilder.reportingManager(manager);
        }

        var user = userBuilder.build();
        userService.saveUser(user);
        var jwt = jwtUtil.generateToken(user);
        return ResponseEntity.ok(AuthenticationResponse.builder().token(jwt).build());
    }
}
