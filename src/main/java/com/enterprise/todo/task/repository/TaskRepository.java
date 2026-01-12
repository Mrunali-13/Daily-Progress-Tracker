package com.enterprise.todo.task.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.enterprise.todo.task.entity.Task;
import com.enterprise.todo.user.entity.User;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUser(User user);

    List<Task> findByUserIn(List<User> users);
}
