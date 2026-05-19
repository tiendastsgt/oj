import { signal, computed } from '@angular/core';
import { ExpedienteEstadisticas } from '../../core/services/expedientes.service';
import { ExpedienteResponse } from '../../core/models/expediente.model';
import { AuditoriaResponse } from '../../core/models/auditoria.model';
import { MOCK_EXPEDIENTES } from '../../core/mocks/expedientes.mock';
import { MOCK_AUDITORIA } from '../../core/mocks/auditoria.mock';

export class DashboardDto {
  // ─── Identidad ───────────────────────────────────────────────
  userName = signal('');
  today    = signal(new Date());

  // ─── KPI stats ───────────────────────────────────────────────
  stats = signal<ExpedienteEstadisticas>({
    totalExpedientes: 6,
    pendientes:       1,
    enProceso:        4,
    resueltos:        1,
    archivados:       0,
  });

  // ─── Expedientes recientes ────────────────────────────────────
  loading              = signal(false);
  expedientesRecientes = signal<ExpedienteResponse[]>(MOCK_EXPEDIENTES.slice(0, 5));
  hasExpedientes       = computed(() => this.expedientesRecientes().length > 0);

  // ─── Actividad (auditoría) ────────────────────────────────────
  loadingAuditoria  = signal(false);
  actividadReciente = signal<AuditoriaResponse[]>(MOCK_AUDITORIA.slice(0, 5));
  hasActividad      = computed(() => this.actividadReciente().length > 0);
}
