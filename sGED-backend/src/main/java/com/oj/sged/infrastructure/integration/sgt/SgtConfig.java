package com.oj.sged.infrastructure.integration.sgt;

/**
 * Configuración base para integración SGT (solo lectura).
 */
public final class SgtConfig {

    public static final int TIMEOUT_MS = 5000;
    public static final int CACHE_TTL_MIN = 5;

    private SgtConfig() {
    }
}
