package com.enterprise.todo.progress.service;

import com.enterprise.todo.progress.entity.ProgressLog;
import com.enterprise.todo.progress.repository.ProgressLogRepository;
import com.enterprise.todo.task.entity.Task;
import com.enterprise.todo.task.repository.TaskRepository;
import com.enterprise.todo.user.entity.User;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProgressService {

    private final ProgressLogRepository progressLogRepository;
    private final TaskRepository taskRepository;

    public ProgressLog addProgress(Long taskId, ProgressLog log, User user) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (!task.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        log.setTask(task);
        if (log.getLogDate() == null) {
            log.setLogDate(LocalDate.now());
        }
        return progressLogRepository.save(log);
    }

    public List<ProgressLog> getProgressByTask(Long taskId, User user) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Allow if user owns task OR is manager
        boolean isOwner = task.getUser().getId().equals(user.getId());
        boolean isManager = task.getUser().getReportingManager() != null &&
                task.getUser().getReportingManager().getId().equals(user.getId());

        if (!isOwner && !isManager) {
            throw new RuntimeException("Unauthorized Access to Progress Logs");
        }

        return progressLogRepository.findByTask(task);
    }
}
