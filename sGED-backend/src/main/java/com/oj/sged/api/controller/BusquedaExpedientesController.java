package com.oj.sged.api.controller;

import com.oj.sged.api.dto.request.BusquedaAvanzadaRequest;
import com.oj.sged.api.dto.response.ApiResponse;
import com.oj.sged.api.dto.response.ExpedienteBusquedaResponse;
import com.oj.sged.application.service.BusquedaExpedientesService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/expedientes/busqueda")
public class BusquedaExpedientesController {

    private final BusquedaExpedientesService busquedaExpedientesService;

    public BusquedaExpedientesController(BusquedaExpedientesService busquedaExpedientesService) {
        this.busquedaExpedientesService = busquedaExpedientesService;
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','SECRETARIO','AUXILIAR','CONSULTA')")
    @GetMapping("/rapida")
    public ResponseEntity<ApiResponse<Page<ExpedienteBusquedaResponse>>> buscarRapida(
        @RequestParam("numero") String numero,
        Pageable pageable,
        HttpServletRequest request
    ) {
        String ip = request.getRemoteAddr();
        Page<ExpedienteBusquedaResponse> response = busquedaExpedientesService.buscarRapida(numero, pageable, ip);
        return ResponseEntity.ok(ApiResponse.ok("Búsqueda rápida", response));
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','SECRETARIO','AUXILIAR','CONSULTA')")
    @PostMapping("/avanzada")
    public ResponseEntity<ApiResponse<Page<ExpedienteBusquedaResponse>>> buscarAvanzada(
        @Valid @RequestBody BusquedaAvanzadaRequest filtros,
        Pageable pageable,
        HttpServletRequest request
    ) {
        String ip = request.getRemoteAddr();
        Page<ExpedienteBusquedaResponse> response = busquedaExpedientesService.buscarAvanzada(filtros, pageable, ip);
        return ResponseEntity.ok(ApiResponse.ok("Búsqueda avanzada", response));
    }
}
