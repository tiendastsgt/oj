package com.oj.sged.application.service;

import com.oj.sged.infrastructure.config.DocumentoStorageProperties;
import com.oj.sged.shared.exception.StorageException;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class DocumentoConversionService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentoConversionService.class);
    private static final int CONVERSION_TIMEOUT_SECONDS = 60;

    private final DocumentoStorageProperties properties;

    public DocumentoConversionService(DocumentoStorageProperties properties) {
        this.properties = properties;
    }

    public Path convertToPdf(Path sourcePath) {
        if (!properties.getConversion().isEnabled()) {
            throw new StorageException("Conversión de documentos deshabilitada", null);
        }
        Path targetPath = sourcePath.resolveSibling(
            sourcePath.getFileName() + properties.getConversion().getTempSuffix()
        );
        if (Files.exists(targetPath)) {
            return targetPath;
        }
        try {
            Path outDir = sourcePath.getParent();
            Process process = new ProcessBuilder(
                "soffice", "--headless", "--norestore",
                "--convert-to", "pdf",
                "--outdir", outDir.toString(),
                sourcePath.toString()
            )
            .redirectErrorStream(true)
            .start();

            String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            boolean finished = process.waitFor(CONVERSION_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                throw new StorageException("soffice timeout after " + CONVERSION_TIMEOUT_SECONDS + "s", null);
            }
            int exitCode = process.exitValue();
            if (exitCode != 0) {
                throw new StorageException("soffice exited " + exitCode + ": " + output.trim(), null);
            }

            // soffice creates <basename>.pdf; rename to our target path
            String sourceFilename = sourcePath.getFileName().toString();
            int dot = sourceFilename.lastIndexOf('.');
            String base = dot >= 0 ? sourceFilename.substring(0, dot) : sourceFilename;
            Path sofficeOutput = outDir.resolve(base + ".pdf");

            if (!Files.exists(sofficeOutput)) {
                throw new StorageException("soffice no generó PDF en: " + sofficeOutput, null);
            }
            Files.move(sofficeOutput, targetPath, StandardCopyOption.REPLACE_EXISTING);
            logger.info("operation=document_convert source={} target={}", sourcePath, targetPath);
            return targetPath;
        } catch (StorageException ex) {
            throw ex;
        } catch (IOException | InterruptedException ex) {
            if (ex instanceof InterruptedException) Thread.currentThread().interrupt();
            throw new StorageException("Error convirtiendo documento a PDF", ex);
        }
    }
}
