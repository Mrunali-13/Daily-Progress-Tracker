package com.enterprise.todo.task.controller;

import com.enterprise.todo.task.entity.Task;
import com.enterprise.todo.task.service.TaskService;
import com.enterprise.todo.user.entity.User;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody Task task, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(taskService.createTask(task, user));
    }

    @GetMapping
    public ResponseEntity<List<com.enterprise.todo.task.dto.TaskResponseDto>> getMyTasks(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(taskService.getTasksByUserDtos(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody Task task,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(taskService.updateTask(id, task, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id, @AuthenticationPrincipal User user) {
        taskService.deleteTask(id, user);
        return ResponseEntity.noContent().build();
    }
}
