package com.enterprise.todo.user.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.enterprise.todo.user.dto.UserDto;
import com.enterprise.todo.user.dto.UserRequest;
import com.enterprise.todo.user.entity.User;
import com.enterprise.todo.user.service.UserService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping
    public ResponseEntity<UserDto> createUser(@RequestBody UserRequest request) {
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        if (request.getManagerId() != null) {
            user.setReportingManager(userService.getUserById(request.getManagerId()));
        }

        User savedUser = userService.saveUser(user);
        return ResponseEntity.ok(mapToDto(savedUser));
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> listUsers() {
        List<UserDto> users = userService.findAllUsers().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id, @RequestBody UserRequest request) {
        User user = userService.getUserById(id);
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getManagerId() != null) {
            user.setReportingManager(userService.getUserById(request.getManagerId()));
        } else {
            user.setReportingManager(null);
        }

        User savedUser = userService.saveUser(user);
        return ResponseEntity.ok(mapToDto(savedUser));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .managerId(user.getReportingManager() != null ? user.getReportingManager().getId() : null)
                .managerName(user.getReportingManager() != null ? user.getReportingManager().getUsername() : null)
                .build();
    }
}
