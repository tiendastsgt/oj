package com.oj.sged.application.service;

import com.oj.sged.infrastructure.config.DocumentoStorageProperties;
import com.oj.sged.shared.exception.FileTooLargeException;
import com.oj.sged.shared.exception.FileTypeNotAllowedException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileValidationService {

    private static final Map<String, Set<String>> EXTENSION_MIME_MAP;

    static {
        Map<String, Set<String>> map = new HashMap<>();
        map.put("pdf", Set.of("application/pdf"));
        map.put("doc", Set.of("application/msword"));
        map.put("docx", Set.of("application/vnd.openxmlformats-officedocument.wordprocessingml.document"));
        map.put("jpg", Set.of("image/jpeg"));
        map.put("jpeg", Set.of("image/jpeg"));
        map.put("png", Set.of("image/png"));
        map.put("gif", Set.of("image/gif"));
        map.put("bmp", Set.of("image/bmp"));
        map.put("mp3", Set.of("audio/mpeg", "audio/mp3"));
        map.put("wav", Set.of("audio/wav", "audio/x-wav"));
        map.put("ogg", Set.of("audio/ogg"));
        map.put("mp4", Set.of("video/mp4"));
        map.put("webm", Set.of("video/webm"));
        map.put("avi", Set.of("video/x-msvideo"));
        map.put("mov", Set.of("video/quicktime"));
        EXTENSION_MIME_MAP = Collections.unmodifiableMap(map);
    }

    private final DocumentoStorageProperties properties;

    public FileValidationService(DocumentoStorageProperties properties) {
        this.properties = properties;
    }

    public void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileTypeNotAllowedException("Archivo vacío o inválido");
        }
        if (file.getSize() > properties.getMaxSizeBytes()) {
            throw new FileTooLargeException("El archivo excede el tamaño máximo permitido (100 MB)");
        }

        String extension = getExtension(file.getOriginalFilename());
        if (extension == null || !EXTENSION_MIME_MAP.containsKey(extension)) {
            throw new FileTypeNotAllowedException("Formato de archivo no permitido");
        }

        String contentType = file.getContentType();
        if (contentType == null || !EXTENSION_MIME_MAP.get(extension).contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new FileTypeNotAllowedException("Tipo MIME no permitido");
        }
    }

    public boolean isSupportedExtension(String extension) {
        return extension != null && EXTENSION_MIME_MAP.containsKey(extension.toLowerCase(Locale.ROOT));
    }

    public String getExtension(String filename) {
        if (filename == null) {
            return null;
        }
        int index = filename.lastIndexOf('.');
        if (index < 0 || index == filename.length() - 1) {
            return null;
        }
        return filename.substring(index + 1).toLowerCase(Locale.ROOT);
    }
}
