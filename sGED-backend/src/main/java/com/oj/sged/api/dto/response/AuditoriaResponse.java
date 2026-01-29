package com.oj.sged.api.dto.response;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de respuesta para un log de auditoría (HU-018 – Consulta de Auditoría).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditoriaResponse {

    private Long id;
    private LocalDateTime fecha;
    private String usuario;
    private String ip;
    private String accion;
    private String modulo;
    private Long recursoId;
    private String detalle;
}
