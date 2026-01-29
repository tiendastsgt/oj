package com.oj.sged.infrastructure.integration.sgt;

import com.oj.sged.api.dto.request.BusquedaAvanzadaRequest;
import java.util.Collections;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

/**
 * Stub temporal para SGTv2 (solo lectura).
 */
@Component
public class Sgtv2ClientStub implements Sgtv2Client {

    @Override
    public List<SgtExpedienteDto> buscarRapida(String numero, Pageable pageable) {
        return Collections.emptyList();
    }

    @Override
    public List<SgtExpedienteDto> buscarAvanzada(BusquedaAvanzadaRequest filtros, Pageable pageable) {
        return Collections.emptyList();
    }
}
