package com.enterprise.todo.progress.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.enterprise.todo.progress.entity.ProgressLog;
import com.enterprise.todo.task.entity.Task;

import java.util.List;

public interface ProgressLogRepository extends JpaRepository<ProgressLog, Long> {
    List<ProgressLog> findByTask(Task task);

    List<ProgressLog> findByTaskIn(List<Task> tasks);
}
