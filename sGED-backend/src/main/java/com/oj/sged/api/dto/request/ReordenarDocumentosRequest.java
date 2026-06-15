package com.oj.sged.api.dto.request;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import lombok.Data;

/**
 * Nuevo orden de los documentos de un expediente.
 * La posición en la lista determina el orden resultante (0 = primero).
 */
@Data
public class ReordenarDocumentosRequest {

    @NotEmpty(message = "La lista de documentos a ordenar es requerida")
    private List<Long> ordenIds;
}
