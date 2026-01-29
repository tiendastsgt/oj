package com.oj.sged.api.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para actualizar datos de un usuario (HU-016 – Gestión de Usuarios).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActualizarUsuarioRequest {

    @Size(min = 5, max = 150, message = "El nombre completo debe tener entre 5 y 150 caracteres")
    private String nombreCompleto;

    @Email(message = "El email debe ser válido")
    @Size(max = 100, message = "El email no puede exceder 100 caracteres")
    private String email;

    private Long rolId;

    private Long juzgadoId;

    private Boolean activo;

    private Boolean bloqueado;
}
