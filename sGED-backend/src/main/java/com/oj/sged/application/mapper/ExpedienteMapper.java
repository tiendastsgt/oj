package com.oj.sged.application.mapper;

import com.oj.sged.api.dto.request.ExpedienteRequest;
import com.oj.sged.api.dto.response.ExpedienteResponse;
import com.oj.sged.infrastructure.persistence.expediente.Expediente;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ExpedienteMapper {

    ExpedienteResponse toResponse(Expediente expediente);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuarioCreacion", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    @Mapping(target = "usuarioModificacion", ignore = true)
    @Mapping(target = "fechaModificacion", ignore = true)
    Expediente toEntity(ExpedienteRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuarioCreacion", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    @Mapping(target = "usuarioModificacion", ignore = true)
    @Mapping(target = "fechaModificacion", ignore = true)
    @Mapping(target = "numero", ignore = true)
    void updateEntity(ExpedienteRequest request, @MappingTarget Expediente expediente);
}
