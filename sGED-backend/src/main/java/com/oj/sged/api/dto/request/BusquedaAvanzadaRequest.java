package com.oj.sged.api.dto.request;

import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.Data;

/**
 * Filtros para búsqueda avanzada de expedientes.
 */
@Data
public class BusquedaAvanzadaRequest {

    /**
     * Número de expediente (coincidencia parcial).
     */
    @Size(max = 50, message = "El número no debe exceder 50 caracteres")
    private String numero;

    /**
     * Fecha de inicio mínima (inclusive).
     */
    private LocalDate fechaDesde;

    /**
     * Fecha de inicio máxima (inclusive).
     */
    private LocalDate fechaHasta;

    /**
     * Identificador de tipo de proceso.
     */
    private Long tipoProcesoId;

    /**
     * Identificador de estado.
     */
    private Long estadoId;

    /**
     * Identificador de juzgado.
     */
    private Long juzgadoId;

    /**
     * Nombre de actor principal (opcional).
     */
    @Size(max = 150, message = "El actor no debe exceder 150 caracteres")
    private String actor;

    /**
     * Nombre de demandado principal (opcional).
     */
    @Size(max = 150, message = "El demandado no debe exceder 150 caracteres")
    private String demandado;

    /**
     * Referencia SGT (opcional).
     */
    @Size(max = 50, message = "La referencia SGT no debe exceder 50 caracteres")
    private String referenciaSgt;
}
