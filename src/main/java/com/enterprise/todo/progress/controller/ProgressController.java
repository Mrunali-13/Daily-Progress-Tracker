package com.enterprise.todo.progress.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.enterprise.todo.progress.entity.ProgressLog;
import com.enterprise.todo.progress.service.ProgressService;
import com.enterprise.todo.user.entity.User;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    @PostMapping("/{taskId}/progress")
    public ResponseEntity<ProgressLog> addProgress(
            @PathVariable Long taskId,
            @RequestBody ProgressLog log,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(progressService.addProgress(taskId, log, user));
    }

    @GetMapping("/{taskId}/progress")
    public ResponseEntity<List<ProgressLog>> getProgress(
            @PathVariable Long taskId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(progressService.getProgressByTask(taskId, user));
    }
}
