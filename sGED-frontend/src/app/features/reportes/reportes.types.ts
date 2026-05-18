export type TipoReporteId = 'movimiento' | 'acceso';

export interface ReporteTipo {
  id: TipoReporteId;
  name: string;
  desc: string;
}

export interface ReporteKpi {
  label: string;
  value: number;
  color: 'azul' | 'dorado' | 'verde' | 'piedra';
}

export interface ReporteFilaDespacho {
  despacho: string;
  ingresados: number;
  enTramite: number;
  resueltos: number;
  archivados: number;
}

export interface ReporteResultado {
  titulo: string;
  periodo: string;
  kpis: ReporteKpi[];
  filas: ReporteFilaDespacho[];
  generadoPor: string;
  fecha: Date;
}
