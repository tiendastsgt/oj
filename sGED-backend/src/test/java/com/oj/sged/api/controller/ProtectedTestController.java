package com.oj.sged.api.controller;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoint protegido solo para pruebas de seguridad.
 */
@RestController
public class ProtectedTestController {

    @GetMapping("/api/v1/protected/ping")
    public ResponseEntity<Map<String, String>> ping() {
        return ResponseEntity.ok(Map.of("status", "OK"));
    }
}
