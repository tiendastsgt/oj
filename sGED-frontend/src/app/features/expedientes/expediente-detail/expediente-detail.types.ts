export enum LoadState {
  Idle    = 'idle',
  Loading = 'loading',
  Success = 'success',
  Error   = 'error',
}

export type ExpedienteTab = 'general' | 'archivos';

export interface ExpedienteHeaderStats {
  fechaIngreso: string;
  partes: string;
  totalArchivos: number;
  ancladosCount: number;
}
