package com.oj.sged.infrastructure.integration.sgt;

import com.oj.sged.api.dto.request.BusquedaAvanzadaRequest;
import java.util.List;
import org.springframework.data.domain.Pageable;

/**
 * Cliente read-only para SGTv2 (prioritario).
 */
public interface Sgtv2Client {

    List<SgtExpedienteDto> buscarRapida(String numero, Pageable pageable);

    List<SgtExpedienteDto> buscarAvanzada(BusquedaAvanzadaRequest filtros, Pageable pageable);
}
