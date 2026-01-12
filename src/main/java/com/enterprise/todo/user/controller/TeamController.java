package com.enterprise.todo.user.controller;

import com.enterprise.todo.task.service.TaskService;
import com.enterprise.todo.task.dto.TaskResponseDto;
import com.enterprise.todo.user.dto.UserDto;
import com.enterprise.todo.user.entity.User;
import com.enterprise.todo.user.service.UserService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('REPORTING_MANAGER') or hasRole('ADMIN')")
public class TeamController {

    private final UserService userService;
    private final TaskService taskService;

    @GetMapping("/api/team/users")
    public ResponseEntity<List<UserDto>> getMyTeam(@AuthenticationPrincipal User manager) {
        List<UserDto> users = userService.getUsersByManager(manager).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/api/team/users/{userId}/tasks")
    public ResponseEntity<List<TaskResponseDto>> getSubordinateTasks(
            @PathVariable Long userId,
            @AuthenticationPrincipal User manager) {
        User subordinate = userService.getUserById(userId);

        // Verify hierarchy
        if (subordinate.getReportingManager() == null
                || !subordinate.getReportingManager().getId().equals(manager.getId())) {
            throw new RuntimeException("Unauthorized: User is not your subordinate");
        }

        return ResponseEntity.ok(taskService.getTasksByUserDtos(subordinate));
    }

    @PostMapping("/api/team/tasks/{taskId}/approve")
    public ResponseEntity<Void> approveTask(@PathVariable Long taskId, @AuthenticationPrincipal User manager) {
        taskService.approveTask(taskId, manager);
        return ResponseEntity.ok().build();
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .managerId(user.getReportingManager() != null ? user.getReportingManager().getId() : null)
                .managerName(user.getReportingManager() != null ? user.getReportingManager().getUsername() : null)
                .build();
    }
}
