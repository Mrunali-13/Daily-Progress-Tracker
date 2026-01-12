package com.enterprise.todo.user.dto;

import com.enterprise.todo.user.entity.Role;
import lombok.Data;

@Data
public class UserRequest {
    private String username;
    private String email;
    private String password;
    private Role role;
    private Long managerId;
}
