import { signal, computed } from '@angular/core';
import { ExpedienteEstadisticas } from '../../core/services/expedientes.service';
import { ExpedienteResponse } from '../../core/models/expediente.model';
import { AuditoriaResponse } from '../../core/models/auditoria.model';
export class DashboardDto {
  // ─── Identidad ───────────────────────────────────────────────
  userName = signal('');
  today    = signal(new Date());

  // ─── KPI stats ───────────────────────────────────────────────
  stats = signal<ExpedienteEstadisticas>({
    totalExpedientes: 0,
    pendientes:       0,
    enProceso:        0,
    resueltos:        0,
    archivados:       0,
  });

  // ─── Expedientes recientes ────────────────────────────────────
  loading              = signal(false);
  expedientesRecientes = signal<ExpedienteResponse[]>([]);
  hasExpedientes       = computed(() => this.expedientesRecientes().length > 0);

  // ─── Actividad (auditoría) ────────────────────────────────────
  loadingAuditoria  = signal(false);
  actividadReciente = signal<AuditoriaResponse[]>([]);
  hasActividad      = computed(() => this.actividadReciente().length > 0);
}
