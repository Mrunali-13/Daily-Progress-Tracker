package com.enterprise.todo.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.enterprise.todo.user.entity.User;

import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    List<User> findByRole(com.enterprise.todo.user.entity.Role role);

    List<User> findByReportingManager(User manager);
}
