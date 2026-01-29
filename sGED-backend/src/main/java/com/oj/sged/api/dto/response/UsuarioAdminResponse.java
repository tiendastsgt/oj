package com.oj.sged.api.dto.response;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de respuesta para un usuario (HU-016 – Gestión de Usuarios).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioAdminResponse {

    private Long id;
    private String username;
    private String nombreCompleto;
    private String email;
    private String rol;               // Nombre del rol
    private String juzgado;           // Nombre o código del juzgado
    private Boolean activo;
    private Boolean bloqueado;
    private Integer intentosFallidos;
    private Boolean debeCambiarPassword;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaModificacion;
}
