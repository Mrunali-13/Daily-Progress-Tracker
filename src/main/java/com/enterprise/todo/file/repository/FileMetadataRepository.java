package com.enterprise.todo.file.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.enterprise.todo.file.entity.FileMetadata;

import java.util.List;

public interface FileMetadataRepository extends JpaRepository<FileMetadata, Long> {
    List<FileMetadata> findByEntityTypeAndEntityId(String entityType, Long entityId);
}
