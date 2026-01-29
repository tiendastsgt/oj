package com.oj.sged.api.controller;

import com.oj.sged.api.dto.response.ApiResponse;
import com.oj.sged.api.dto.response.CatalogoEstadoResponse;
import com.oj.sged.api.dto.response.CatalogoJuzgadoResponse;
import com.oj.sged.api.dto.response.CatalogoTipoProcesoResponse;
import com.oj.sged.infrastructure.persistence.auth.repository.CatJuzgadoRepository;
import com.oj.sged.infrastructure.persistence.expediente.repository.CatEstadoRepository;
import com.oj.sged.infrastructure.persistence.expediente.repository.CatTipoProcesoRepository;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/catalogos")
public class CatalogosController {

    private final CatTipoProcesoRepository catTipoProcesoRepository;
    private final CatEstadoRepository catEstadoRepository;
    private final CatJuzgadoRepository catJuzgadoRepository;

    public CatalogosController(
        CatTipoProcesoRepository catTipoProcesoRepository,
        CatEstadoRepository catEstadoRepository,
        CatJuzgadoRepository catJuzgadoRepository
    ) {
        this.catTipoProcesoRepository = catTipoProcesoRepository;
        this.catEstadoRepository = catEstadoRepository;
        this.catJuzgadoRepository = catJuzgadoRepository;
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','SECRETARIO','AUXILIAR','CONSULTA')")
    @GetMapping("/tipos-proceso")
    public ResponseEntity<ApiResponse<List<CatalogoTipoProcesoResponse>>> listarTiposProceso() {
        List<CatalogoTipoProcesoResponse> response = catTipoProcesoRepository.findAll().stream()
            .map(item -> CatalogoTipoProcesoResponse.builder()
                .id(item.getId())
                .nombre(item.getNombre())
                .descripcion(item.getDescripcion())
                .activo(item.getActivo() != null && item.getActivo() == 1)
                .build())
            .toList();
        return ResponseEntity.ok(ApiResponse.ok("Catálogo de tipos de proceso", response));
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','SECRETARIO','AUXILIAR','CONSULTA')")
    @GetMapping("/estados-expediente")
    public ResponseEntity<ApiResponse<List<CatalogoEstadoResponse>>> listarEstadosExpediente() {
        List<CatalogoEstadoResponse> response = catEstadoRepository.findAll().stream()
            .map(item -> CatalogoEstadoResponse.builder()
                .id(item.getId())
                .nombre(item.getNombre())
                .descripcion(item.getDescripcion())
                .activo(item.getActivo() != null && item.getActivo() == 1)
                .build())
            .toList();
        return ResponseEntity.ok(ApiResponse.ok("Catálogo de estados", response));
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR','SECRETARIO','AUXILIAR','CONSULTA')")
    @GetMapping("/juzgados")
    public ResponseEntity<ApiResponse<List<CatalogoJuzgadoResponse>>> listarJuzgados() {
        List<CatalogoJuzgadoResponse> response = catJuzgadoRepository.findAll().stream()
            .map(item -> CatalogoJuzgadoResponse.builder()
                .id(item.getId())
                .codigo(item.getCodigo())
                .nombre(item.getNombre())
                .activo(item.getActivo() != null && item.getActivo() == 1)
                .build())
            .toList();
        return ResponseEntity.ok(ApiResponse.ok("Catálogo de juzgados", response));
    }
}
