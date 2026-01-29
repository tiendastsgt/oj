package com.oj.sged.api.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para crear un nuevo usuario (HU-016 – Gestión de Usuarios).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrearUsuarioRequest {

    @NotBlank(message = "El nombre de usuario es requerido")
    @Size(min = 3, max = 50, message = "El nombre de usuario debe tener entre 3 y 50 caracteres")
    private String username;

    @NotBlank(message = "El nombre completo es requerido")
    @Size(min = 5, max = 150, message = "El nombre completo debe tener entre 5 y 150 caracteres")
    private String nombreCompleto;

    @NotBlank(message = "El email es requerido")
    @Email(message = "El email debe ser válido")
    @Size(max = 100, message = "El email no puede exceder 100 caracteres")
    private String email;

    @NotNull(message = "El ID del rol es requerido")
    private Long rolId;

    @NotNull(message = "El ID del juzgado es requerido")
    private Long juzgadoId;
}
