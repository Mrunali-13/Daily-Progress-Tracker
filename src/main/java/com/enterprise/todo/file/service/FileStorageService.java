package com.enterprise.todo.file.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface FileStorageService {
    String storeFile(MultipartFile file);

    Resource loadFileAsResource(String fileName);

    void deleteFile(String fileName);
}
