export interface ExpedienteRequest {
  numero: string;
  tipoProcesoId: number;
  juzgadoId: number;
  estadoId: number;
  fechaInicio: string | Date;
  descripcion: string;
  observaciones?: string;
  referenciaSgt?: string;
  referenciaFuente?: string;
}

export interface ExpedienteResponse extends ExpedienteRequest {
  id: number;
  usuarioCreacion: string;
  fechaCreacion: string;
  usuarioModificacion?: string;
  fechaModificacion?: string;
}
