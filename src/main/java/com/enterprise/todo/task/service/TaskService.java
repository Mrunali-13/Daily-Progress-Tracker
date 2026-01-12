package com.enterprise.todo.task.service;

import com.enterprise.todo.file.repository.FileMetadataRepository;
import com.enterprise.todo.task.dto.TaskResponseDto;
import com.enterprise.todo.task.entity.Priority;
import com.enterprise.todo.task.entity.Task;
import com.enterprise.todo.task.entity.TaskStatus;
import com.enterprise.todo.task.repository.TaskRepository;
import com.enterprise.todo.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final FileMetadataRepository fileMetadataRepository;

    public Task createTask(Task task, User user) {
        task.setUser(user);
        task.setStatus(TaskStatus.PENDING);
        if (task.getPriority() == null) {
            task.setPriority(Priority.MEDIUM);
        }
        return taskRepository.save(task);
    }

    public Task updateTask(Long taskId, Task updatedTask, User user) {
        Task task = getTaskById(taskId);
        if (!task.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        task.setTitle(updatedTask.getTitle());
        task.setDescription(updatedTask.getDescription());
        if (updatedTask.getStatus() != null) {
            task.setStatus(updatedTask.getStatus());
        }
        if (updatedTask.getPriority() != null) {
            task.setPriority(updatedTask.getPriority());
        }
        task.setDueDate(updatedTask.getDueDate());
        return taskRepository.save(task);
    }

    public List<TaskResponseDto> getTasksByUserDtos(User user) {
        return taskRepository.findByUser(user).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public TaskResponseDto mapToDto(Task task) {
        return TaskResponseDto.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .dueDate(task.getDueDate())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .attachments(fileMetadataRepository.findByEntityTypeAndEntityId("TASK", task.getId()))
                .build();
    }

    public List<Task> getTasksByUser(User user) {
        return taskRepository.findByUser(user);
    }

    public Task getTaskById(Long id) {
        if (id == null)
            throw new RuntimeException("Task ID cannot be null");
        return taskRepository.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));
    }

    public void approveTask(Long taskId, User manager) {
        Task task = getTaskById(taskId);
        User subordinate = task.getUser();
        if (subordinate.getReportingManager() == null
                || !subordinate.getReportingManager().getId().equals(manager.getId())) {
            throw new RuntimeException("Unauthorized: You are not the manager of this task owner");
        }
        if (task.getStatus() != TaskStatus.COMPLETED) {
            throw new RuntimeException("Task must be COMPLETED before it can be approved");
        }
        task.setStatus(TaskStatus.APPROVED);
        taskRepository.save(task);
    }

    public void deleteTask(Long id, User user) {
        Task task = getTaskById(id);
        if (!task.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        taskRepository.delete(task);
    }
}
