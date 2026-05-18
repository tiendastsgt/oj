export interface ExpedienteResultadoUI {
  id: number | null;
  numero: string;
  juzgado: string;
  estado: string;
  tipoProceso: string;
  fechaInicio: string;
  tipoClass: string;
  ancladosCount: number;
  partes: string;
}

export interface FilterPill {
  id: string;
  label: string;
}

export interface PaginacionUI {
  page: number;
  total: number;
  totalPages: number;
  size: number;
}

export interface FiltrosDrawerState {
  fechaDesde: string;
  fechaHasta: string;
  soloAnclados: boolean;
  soloAsignados: boolean;
  soloAudienciaProxima: boolean;
}
