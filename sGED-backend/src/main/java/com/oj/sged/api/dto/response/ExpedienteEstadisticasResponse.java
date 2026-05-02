package com.oj.sged.api.dto.response;

public record ExpedienteEstadisticasResponse(
    long totalExpedientes,
    long pendientes,
    long enProceso,
    long resueltos,
    long archivados
) {}
