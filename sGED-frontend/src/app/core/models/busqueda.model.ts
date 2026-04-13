export interface BusquedaAvanzadaRequest {
  numero?: string;
  fechaDesde?: string | Date;
  fechaHasta?: string | Date;
  estadoId?: number;
  tipoProcesoId?: number;
  juzgadoId?: number;
  actorPrincipal?: string;
  demandadoPrincipal?: string;
  referenciaSgt?: string;
  fuente?: string;
}

export interface ExpedienteBusquedaResponse {
  id?: number | null;
  numero: string;
  juzgado: string;
  estado: string;
  tipoProceso: string;
  fechaInicio: string;
  fechaUltimoMovimiento?: string;
  fuente: 'SGED' | 'SGTV2' | 'SGTV1';
  actorPrincipal?: string;
  demandadoPrincipal?: string;
}
