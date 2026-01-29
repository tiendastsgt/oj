package com.oj.sged.api.dto.response;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DocumentoResponse {

    private Long id;
    private Long expedienteId;
    private String expedienteNumero;
    private String nombreOriginal;
    private String tipoDocumento;
    private Long tipoDocumentoId;
    private Long tamanio;
    private String mimeType;
    private String extension;
    private String categoria;
    private String usuarioCreacion;
    private LocalDateTime fechaCreacion;
}
