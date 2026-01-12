package com.enterprise.todo.task.dto;

import com.enterprise.todo.file.entity.FileMetadata;
import com.enterprise.todo.task.entity.Priority;
import com.enterprise.todo.task.entity.TaskStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class TaskResponseDto {
    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private Priority priority;
    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<FileMetadata> attachments;
}
