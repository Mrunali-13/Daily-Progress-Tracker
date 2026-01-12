package com.enterprise.todo.user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.enterprise.todo.user.entity.User;
import com.enterprise.todo.user.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;

    // In a real app we would have a PasswordEncoder dependency here if we were
    // creating users,
    // but for now we might leave it or add it if the method is implemented here.
    // private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }

    public User loadUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getUsersByManager(User manager) {
        return userRepository.findByReportingManager(manager);
    }

    public List<User> getUsersByRole(com.enterprise.todo.user.entity.Role role) {
        return userRepository.findByRole(role);
    }

    public User getUserById(Long id) {
        if (id == null)
            throw new RuntimeException("ID cannot be null");
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public void deleteUser(Long id) {
        if (id == null)
            return;
        userRepository.deleteById(id);
    }
}
