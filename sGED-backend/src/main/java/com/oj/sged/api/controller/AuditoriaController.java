package com.oj.sged.api.controller;

import com.oj.sged.api.dto.response.ApiResponse;
import com.oj.sged.api.dto.response.AuditoriaResponse;
import com.oj.sged.application.service.AuditoriaConsultaService;
import java.time.LocalDateTime;
import java.util.Objects;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controlador REST para consulta de auditoría (HU-018).
 * Endpoints protegidos para ADMINISTRADOR.
 */
@RestController
@RequestMapping("/api/v1/admin/auditoria")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class AuditoriaController {

    private final AuditoriaConsultaService auditoriaConsultaService;

    public AuditoriaController(AuditoriaConsultaService auditoriaConsultaService) {
        this.auditoriaConsultaService = auditoriaConsultaService;
    }

    /**
     * GET /api/v1/admin/auditoria
     * Consulta logs de auditoría con filtros opcionales y paginación.
     *
     * Query params:
     * - usuario: String (opcional, búsqueda por contiene)
     * - modulo: String (opcional, ej. ADMIN, EXPEDIENTE, DOCUMENTO)
     * - accion: String (opcional, ej. USUARIO_CREADO, LOGIN_EXITOSO)
     * - fechaDesde: LocalDateTime (opcional, ISO format)
     * - fechaHasta: LocalDateTime (opcional, ISO format)
     * - recursoId: Long (opcional)
     * - page: int (default 0)
     * - size: int (default 50)
     * - sort: String (default "fecha,desc")
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<AuditoriaResponse>>> consultar(
        @RequestParam(required = false) String usuario,
        @RequestParam(required = false) String modulo,
        @RequestParam(required = false) String accion,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaDesde,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaHasta,
        @RequestParam(required = false) Long recursoId,
        Pageable pageable
    ) {
        Page<AuditoriaResponse> resultado = auditoriaConsultaService.consultar(
            usuario,
            modulo,
            accion,
            fechaDesde,
            fechaHasta,
            recursoId,
            Objects.requireNonNull(pageable)
        );
        return ResponseEntity.ok(ApiResponse.ok("Auditoría consultada correctamente", resultado));
    }

    /**
     * GET /api/v1/admin/auditoria/{id}
     * Obtiene el detalle de un log de auditoría específico.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AuditoriaResponse>> obtener(
        @PathVariable Long id
    ) {
        AuditoriaResponse resultado = auditoriaConsultaService.obtener(Objects.requireNonNull(id));
        return ResponseEntity.ok(ApiResponse.ok("Log de auditoría obtenido correctamente", resultado));
    }
}
