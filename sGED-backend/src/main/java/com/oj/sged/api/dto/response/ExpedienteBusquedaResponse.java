package com.oj.sged.api.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

/**
 * Resultado unificado de búsqueda de expedientes (SGED/SGTv1/SGTv2).
 */
@Data
@Builder
public class ExpedienteBusquedaResponse {

    /**
     * Identificador SGED (nulo si proviene de SGT).
     */
    private Long id;

    /**
     * Número de expediente.
     */
    private String numero;

    /**
     * Juzgado (nombre o código).
     */
    private String juzgado;

    /**
     * Estado del expediente.
     */
    private String estado;

    /**
     * Tipo de proceso.
     */
    private String tipoProceso;

    /**
     * Fecha de inicio del expediente.
     */
    private LocalDate fechaInicio;

    /**
     * Fecha de último movimiento (según fuente).
     */
    private LocalDateTime fechaUltimoMovimiento;

    /**
     * Fuente del resultado: SGED | SGTV2 | SGTV1.
     */
    private String fuente;

    /**
     * Actor principal (opcional).
     */
    private String actorPrincipal;

    /**
     * Demandado principal (opcional).
     */
    private String demandadoPrincipal;
}
