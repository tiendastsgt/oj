package com.oj.sged.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Seguridad exclusiva del perfil QA.
 * Abre /h2-console/** sin JWT para inspección directa de la BD H2 en memoria.
 * NUNCA eliminar @Profile("qa") — esta clase no debe activarse fuera de QA.
 */
@Configuration
@Profile("qa")
public class QaSecurityConfig {

    @Bean
    @Order(1)
    public SecurityFilterChain h2ConsoleFilterChain(HttpSecurity http) throws Exception {
        return http
            .securityMatcher("/h2-console/**")
            .csrf(csrf -> csrf.disable())
            .headers(headers -> headers.frameOptions(fo -> fo.disable()))
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
            .build();
    }
}
