package com.oj.sged.application.service;

import com.oj.sged.infrastructure.config.DocumentoStorageProperties;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.assertTrue;

class DocumentoStorageServiceTest {

    @TempDir
    Path tempDir;

    @Test
    void shouldStoreFileInYearMonthExpedientePath() {
        DocumentoStorageProperties properties = new DocumentoStorageProperties();
        properties.setBasePath(tempDir.toString());
        properties.setMaxSizeBytes(10_000L);
        DocumentoStorageService storageService = new DocumentoStorageService(properties);

        MockMultipartFile file = new MockMultipartFile(
            "file",
            "test.pdf",
            "application/pdf",
            "contenido".getBytes()
        );

        DocumentoStorageService.StoredFileInfo info = storageService.store(10L, 99L, file, "pdf");
        Path storedPath = tempDir.resolve(info.getRutaRelativa()).resolve(info.getNombreStorage());
        assertTrue(Files.exists(storedPath));
    }
}
