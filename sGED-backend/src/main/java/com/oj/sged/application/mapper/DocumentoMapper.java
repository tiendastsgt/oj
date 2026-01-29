package com.oj.sged.application.mapper;

import com.oj.sged.api.dto.response.DocumentoResponse;
import com.oj.sged.infrastructure.persistence.documento.Documento;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DocumentoMapper {

    @Mapping(target = "expedienteId", source = "expediente.id")
    @Mapping(target = "expedienteNumero", source = "expediente.numero")
    @Mapping(target = "tipoDocumento", source = "tipoDocumento.nombre")
    @Mapping(target = "tipoDocumentoId", source = "tipoDocumento.id")
    @Mapping(
        target = "categoria",
        expression = "java(com.oj.sged.shared.util.DocumentoCategoriaUtil.resolveCategoria(documento.getExtension()))"
    )
    DocumentoResponse toResponse(Documento documento);
}
