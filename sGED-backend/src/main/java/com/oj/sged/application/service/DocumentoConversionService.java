package com.oj.sged.application.service;

import com.oj.sged.infrastructure.config.DocumentoStorageProperties;
import com.oj.sged.shared.exception.StorageException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.jodconverter.core.DocumentConverter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class DocumentoConversionService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentoConversionService.class);

    private final java.util.Optional<DocumentConverter> documentConverter;
    private final DocumentoStorageProperties properties;

    public DocumentoConversionService(java.util.Optional<DocumentConverter> documentConverter, DocumentoStorageProperties properties) {
        this.documentConverter = documentConverter;
        this.properties = properties;
    }

    public Path convertToPdf(Path sourcePath) {
        if (!properties.getConversion().isEnabled()) {
            throw new StorageException("Conversión de documentos deshabilitada", null);
        }
        Path targetPath = sourcePath.resolveSibling(sourcePath.getFileName() + properties.getConversion().getTempSuffix());
        try {
            if (Files.exists(targetPath)) {
                return targetPath;
            }
            if (documentConverter.isEmpty()) {
                throw new StorageException("Motor de conversión (JODConverter) no disponible", null);
            }
            documentConverter.get().convert(sourcePath.toFile()).to(targetPath.toFile()).execute();
            logger.info("operation=document_convert source={} target={}", sourcePath, targetPath);
            return targetPath;
        } catch (Exception ex) {
            throw new StorageException("Error convirtiendo documento a PDF", ex);
        }
    }
}
