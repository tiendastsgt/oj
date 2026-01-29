package com.oj.sged.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.Data;

@Data
public class ExpedienteRequest {

    @NotBlank(message = "El número de expediente es requerido")
    @Size(max = 50, message = "El número de expediente no debe exceder 50 caracteres")
    private String numero;

    @NotNull(message = "El tipo de proceso es requerido")
    private Long tipoProcesoId;

    @NotNull(message = "El juzgado es requerido")
    private Long juzgadoId;

    @NotNull(message = "El estado es requerido")
    private Long estadoId;

    @NotNull(message = "La fecha de inicio es requerida")
    private LocalDate fechaInicio;

    @NotBlank(message = "La descripción es requerida")
    @Size(max = 500, message = "La descripción no debe exceder 500 caracteres")
    private String descripcion;

    @Size(max = 1000, message = "Las observaciones no deben exceder 1000 caracteres")
    private String observaciones;

    @Size(max = 50, message = "La referencia SGT no debe exceder 50 caracteres")
    private String referenciaSgt;

    @Pattern(regexp = "SGTV1|SGTV2", message = "La referencia fuente debe ser SGTV1 o SGTV2")
    @Size(max = 10, message = "La referencia fuente no debe exceder 10 caracteres")
    private String referenciaFuente;
}
