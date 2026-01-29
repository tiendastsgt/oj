package com.oj.sged;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Punto de entrada principal de SGED.
 */
@SpringBootApplication
@EnableAsync
@ConfigurationPropertiesScan
public class SgedApplication {

    public static void main(String[] args) {
        SpringApplication.run(SgedApplication.class, args);
    }
}
