package com.enterprise.todo.progress.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.enterprise.todo.task.entity.Task;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@ToString(exclude = "task")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "progress_log")
public class ProgressLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private int completionPercentage; // e.g., 50 for 50%

    @Column(nullable = false)
    private LocalDate logDate;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
