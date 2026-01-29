package com.oj.sged.api.controller;

import com.oj.sged.api.dto.request.ExpedienteRequest;
import com.oj.sged.api.dto.response.ApiResponse;
import com.oj.sged.api.dto.response.ExpedienteResponse;
import com.oj.sged.application.service.ExpedienteService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/expedientes")
public class ExpedienteController {

    private final ExpedienteService expedienteService;

    public ExpedienteController(ExpedienteService expedienteService) {
        this.expedienteService = expedienteService;
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','SECRETARIO','AUXILIAR','CONSULTA')")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ExpedienteResponse>>> listar(Pageable pageable) {
        Page<ExpedienteResponse> response = expedienteService.listarExpedientes(pageable);
        return ResponseEntity.ok(ApiResponse.ok("Listado de expedientes", response));
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','SECRETARIO','AUXILIAR')")
    @PostMapping
    public ResponseEntity<ApiResponse<ExpedienteResponse>> crear(
        @Valid @RequestBody ExpedienteRequest request,
        HttpServletRequest httpRequest
    ) {
        String ip = httpRequest.getRemoteAddr();
        ExpedienteResponse response = expedienteService.crearExpediente(request, ip);
        return ResponseEntity.ok(ApiResponse.ok("Expediente creado", response));
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','SECRETARIO','AUXILIAR','CONSULTA')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpedienteResponse>> detalle(
        @PathVariable Long id,
        HttpServletRequest httpRequest
    ) {
        String ip = httpRequest.getRemoteAddr();
        ExpedienteResponse response = expedienteService.obtenerDetalleExpediente(id, ip);
        return ResponseEntity.ok(ApiResponse.ok("Detalle de expediente", response));
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','SECRETARIO')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpedienteResponse>> editar(
        @PathVariable Long id,
        @Valid @RequestBody ExpedienteRequest request,
        HttpServletRequest httpRequest
    ) {
        String ip = httpRequest.getRemoteAddr();
        ExpedienteResponse response = expedienteService.editarExpediente(id, request, ip);
        return ResponseEntity.ok(ApiResponse.ok("Expediente actualizado", response));
    }
}
