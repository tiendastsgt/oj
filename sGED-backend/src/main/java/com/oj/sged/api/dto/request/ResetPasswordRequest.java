package com.oj.sged.api.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para resetear contraseña de un usuario (HU-016 – Gestión de Usuarios).
 * Si passwordNueva no se proporciona, el backend genera una contraseña temporal.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResetPasswordRequest {

    // Opcional: si no se proporciona, el backend genera una temporal
    private String passwordNueva;
}
