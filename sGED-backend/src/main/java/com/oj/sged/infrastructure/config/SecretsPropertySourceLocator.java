package com.oj.sged.infrastructure.config;

import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.boot.SpringApplication;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

/**
 * EnvironmentPostProcessor que soporta Docker secrets pattern (*_FILE).
 * Lee secrets desde archivos en /run/secrets/ o desde variables _FILE.
 */
public class SecretsPropertySourceLocator implements EnvironmentPostProcessor {

    private static final String SECRETS_DIR = "/run/secrets";
    private static final String FILE_SUFFIX = "_FILE";
    
    private static final String[] SECRET_KEYS = {
        "DB_PASSWORD", "DB_USER", "JWT_SECRET", 
        "ORACLE_PASSWORD", "SGT_API_KEY", "ENCRYPTION_KEY"
    };

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Map<String, Object> properties = new HashMap<>();

        for (String secretKey : SECRET_KEYS) {
            String filePathValue = environment.getProperty(secretKey + FILE_SUFFIX);
            if (filePathValue != null && !filePathValue.isBlank()) {
                try {
                    String secretValue = readSecretFromFile(filePathValue);
                    if (secretValue != null && !secretValue.isBlank()) {
                        properties.put(secretKey, secretValue);
                    }
                } catch (IOException e) {
                    System.err.println("[SECRETS] Error reading " + secretKey + ": " + e.getMessage());
                }
            }
        }

        loadSecretsFromDirectory(properties);
        
        if (!properties.isEmpty()) {
            environment.getPropertySources().addFirst(
                new MapPropertySource("secrets-from-files", properties)
            );
        }
    }

    private String readSecretFromFile(String filePath) throws IOException {
        Path path = Paths.get(filePath);
        if (Files.exists(path)) {
            return new String(Files.readAllBytes(path)).trim();
        }
        return null;
    }

    private void loadSecretsFromDirectory(Map<String, Object> properties) {
        Path dir = Paths.get(SECRETS_DIR);
        
        if (!Files.exists(dir) || !Files.isDirectory(dir)) {
            return;
        }

        try {
            Files.list(dir).forEach(path -> {
                try {
                    if (Files.isRegularFile(path)) {
                        String envVarName = path.getFileName().toString()
                            .replace("-", "_").toUpperCase();
                        String secretValue = readSecretFromFile(path.toString());
                        if (secretValue != null && !secretValue.isEmpty()) {
                            properties.put(envVarName, secretValue);
                        }
                    }
                } catch (IOException e) {
                    // Silent fail
                }
            });
        } catch (IOException e) {
            // Silent fail
        }
    }
}
