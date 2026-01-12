package com.enterprise.todo.user.dto;

import com.enterprise.todo.user.entity.Role;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private Role role;
    private Long managerId;
    private String managerName;
}
