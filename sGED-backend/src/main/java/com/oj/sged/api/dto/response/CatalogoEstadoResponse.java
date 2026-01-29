package com.oj.sged.api.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CatalogoEstadoResponse {

    private Long id;
    private String nombre;
    private String descripcion;
    private boolean activo;
}
