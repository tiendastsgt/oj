package com.oj.sged.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.SyncTaskExecutor;
import org.springframework.core.task.TaskExecutor;

/**
 * Configuración de pruebas para ejecutar tareas @Async en el mismo hilo.
 */
@Configuration
public class AsyncTestConfig {

    @Bean
    public TaskExecutor taskExecutor() {
        return new SyncTaskExecutor();
    }
}
