package com.oj.sged.api.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ExpedienteResponse {

    private Long id;
    private String numero;
    private Long tipoProcesoId;
    private Long juzgadoId;
    private Long estadoId;
    private LocalDate fechaInicio;
    private String descripcion;
    private String observaciones;
    private String referenciaSgt;
    private String referenciaFuente;
    private String usuarioCreacion;
    private LocalDateTime fechaCreacion;
    private String usuarioModificacion;
    private LocalDateTime fechaModificacion;
}
