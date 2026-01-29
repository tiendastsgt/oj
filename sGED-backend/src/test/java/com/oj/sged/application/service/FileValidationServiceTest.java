package com.oj.sged.application.service;

import com.oj.sged.infrastructure.config.DocumentoStorageProperties;
import com.oj.sged.shared.exception.FileTooLargeException;
import com.oj.sged.shared.exception.FileTypeNotAllowedException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class FileValidationServiceTest {

    private FileValidationService fileValidationService;

    @BeforeEach
    void setUp() {
        DocumentoStorageProperties properties = new DocumentoStorageProperties();
        properties.setBasePath("C:/tmp");
        properties.setMaxSizeBytes(1_000L);
        fileValidationService = new FileValidationService(properties);
    }

    @Test
    void shouldAcceptValidPdf() {
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "test.pdf",
            "application/pdf",
            new byte[100]
        );
        assertDoesNotThrow(() -> fileValidationService.validate(file));
    }

    @Test
    void shouldRejectLargeFile() {
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "test.pdf",
            "application/pdf",
            new byte[2_000]
        );
        assertThrows(FileTooLargeException.class, () -> fileValidationService.validate(file));
    }

    @Test
    void shouldRejectInvalidExtension() {
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "test.exe",
            "application/octet-stream",
            new byte[10]
        );
        assertThrows(FileTypeNotAllowedException.class, () -> fileValidationService.validate(file));
    }

    @Test
    void shouldRejectInvalidMime() {
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "test.pdf",
            "text/plain",
            new byte[10]
        );
        assertThrows(FileTypeNotAllowedException.class, () -> fileValidationService.validate(file));
    }
}
