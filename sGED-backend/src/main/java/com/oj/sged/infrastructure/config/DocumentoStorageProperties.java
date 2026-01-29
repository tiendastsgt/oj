package com.oj.sged.infrastructure.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Data
@Validated
@ConfigurationProperties(prefix = "sged.documentos.storage")
public class DocumentoStorageProperties {

    @NotBlank
    private String basePath;

    @NotNull
    private Long maxSizeBytes;

    private Conversion conversion = new Conversion();

    @Data
    public static class Conversion {
        private boolean enabled = true;
        private String tempSuffix = ".preview.pdf";
    }
}
