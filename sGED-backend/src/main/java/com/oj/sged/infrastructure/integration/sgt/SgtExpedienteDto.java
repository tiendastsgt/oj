package com.oj.sged.infrastructure.integration.sgt;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

/**
 * DTO de expediente proveniente de SGT (solo lectura).
 */
@Data
@Builder
public class SgtExpedienteDto {

    private String numero;
    private Long juzgadoId;
    private String juzgadoCodigo;
    private String juzgadoNombre;
    private String estado;
    private String tipoProceso;
    private LocalDate fechaInicio;
    private LocalDateTime fechaUltimoMovimiento;
    private String actorPrincipal;
    private String demandadoPrincipal;
    private String referenciaSgt;
}
