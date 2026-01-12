package com.enterprise.todo.file.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.enterprise.todo.file.entity.FileMetadata;
import com.enterprise.todo.file.repository.FileMetadataRepository;
import com.enterprise.todo.file.service.FileStorageService;
import com.enterprise.todo.user.entity.User;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;
    private final FileMetadataRepository fileMetadataRepository;

    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/png", "image/jpeg", "application/pdf",
            "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("entityType") String entityType, // TASK or PROGRESS
            @RequestParam("entityId") Long entityId,
            @AuthenticationPrincipal User user) {

        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest()
                    .body("File size exceeds maximum allowed size of 5MB. Your file size: "
                            + String.format("%.2f", file.getSize() / (1024.0 * 1024.0)) + "MB");
        }

        // Validate file type
        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            return ResponseEntity.badRequest()
                    .body("Invalid file type: " + file.getContentType()
                            + ". Allowed types: PNG, JPEG, PDF, Excel");
        }

        String fileName = fileStorageService.storeFile(file);

        // Use ServletUriComponentsBuilder to construct absolute URL if needed, mostly
        // for download link
        // Use ServletUriComponentsBuilder to construct absolute URL if needed, mostly
        // for download link

        // Store the fileName instead of the full URL to avoid host/port issues
        FileMetadata metadata = FileMetadata.builder()
                .fileName(fileName)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .filePath("/api/files/download/" + fileName)
                .uploadedBy(user)
                .entityType(entityType)
                .entityId(entityId)
                .uploadedAt(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(fileMetadataRepository.save(metadata));
    }

    @GetMapping("/download/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName, HttpServletRequest request) {
        // Load file as Resource
        Resource resource = fileStorageService.loadFileAsResource(fileName);

        // Try to determine file's content type
        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            // Default to binary
        }

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
