package com.oj.sged.application.service;

import com.oj.sged.infrastructure.config.DocumentoStorageProperties;
import com.oj.sged.infrastructure.persistence.documento.Documento;
import com.oj.sged.shared.exception.StorageException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import lombok.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DocumentoStorageService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentoStorageService.class);
    private static final DateTimeFormatter MONTH_FORMAT = DateTimeFormatter.ofPattern("MM");

    private final DocumentoStorageProperties properties;

    public DocumentoStorageService(DocumentoStorageProperties properties) {
        this.properties = properties;
    }

    public StoredFileInfo store(Long expedienteId, Long documentoId, MultipartFile file, String extension) {
        LocalDate now = LocalDate.now();
        String year = String.valueOf(now.getYear());
        String month = MONTH_FORMAT.format(now);
        String sanitizedName = sanitizeFilename(file.getOriginalFilename());
        String storageName = documentoId + "_" + sanitizedName;
        String relativePath = String.join("/", year, month, String.valueOf(expedienteId), String.valueOf(documentoId));
        Path targetDirectory = Paths.get(properties.getBasePath(), relativePath);
        Path targetFile = targetDirectory.resolve(storageName);

        try {
            Files.createDirectories(targetDirectory);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetFile, StandardCopyOption.REPLACE_EXISTING);
            }
            logger.info("operation=document_store expedienteId={} storageName={} path={}",
                expedienteId, storageName, targetFile);
            return new StoredFileInfo(relativePath, storageName);
        } catch (IOException ex) {
            throw new StorageException("Error almacenando el archivo en el sistema de archivos", ex);
        }
    }

    private String sanitizeFilename(String originalFilename) {
        String cleaned = StringUtils.cleanPath(originalFilename == null ? "documento" : originalFilename);
        String baseName = StringUtils.getFilename(cleaned);
        if (!StringUtils.hasText(baseName)) {
            baseName = "documento";
        }
        String safe = baseName.replaceAll("[^A-Za-z0-9._-]", "_");
        if (safe.length() > 80) {
            safe = safe.substring(0, 80);
        }
        return safe;
    }

    public Path resolvePath(Documento documento) {
        if (documento == null || !StringUtils.hasText(documento.getRuta())) {
            return null;
        }
        return Paths.get(properties.getBasePath(), documento.getRuta(), documento.getNombreStorage());
    }

    @Value
    public static class StoredFileInfo {
        String rutaRelativa;
        String nombreStorage;
    }
}
