/**
 * Modelos para auditoría (Fase 5 - HU-018)
 */

export interface AuditoriaResponse {
  id: number;
  fecha: string; // ISO date-time
  usuario: string;
  ip: string;
  accion: string;
  modulo: string;
  recursoId?: number;
  detalle: string;
}

export interface AuditoriaFiltros {
  usuario?: string;
  modulo?: string;
  accion?: string;
  fechaDesde?: string; // ISO date-time
  fechaHasta?: string; // ISO date-time
  recursoId?: number;
  page?: number;
  size?: number;
  sort?: string;
}
