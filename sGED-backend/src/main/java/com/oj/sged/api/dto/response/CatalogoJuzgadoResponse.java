package com.oj.sged.api.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CatalogoJuzgadoResponse {

    private Long id;
    private String codigo;
    private String nombre;
    private boolean activo;
}
