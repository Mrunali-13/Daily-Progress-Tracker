package com.enterprise.todo.file.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.enterprise.todo.user.entity.User;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString(exclude = "uploadedBy")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "file_metadata")
public class FileMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fileName;

    private String fileType;

    private long fileSize;

    @Column(nullable = false)
    private String filePath; // Relative or absolute path on disk

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;

    // Establishing a polymorphic-like relationship manually or just storing ID/Type
    private Long entityId; // ID of Task or User or Login

    private String entityType; // TASK, PROGRESS, PROFILE, etc.

    @CreationTimestamp
    private LocalDateTime uploadedAt;
}
