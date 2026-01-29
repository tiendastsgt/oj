/**
 * Modelos para administración de usuarios (Fase 5 - HU-016, HU-017)
 */

export interface CrearUsuarioRequest {
  username: string;
  nombreCompleto: string;
  email: string;
  rolId: number;
  juzgadoId: number;
}

export interface ActualizarUsuarioRequest {
  nombreCompleto?: string;
  email?: string;
  rolId?: number;
  juzgadoId?: number;
  activo?: boolean;
  bloqueado?: boolean;
}

export interface ResetPasswordRequest {
  // Opcional, puede estar vacío
}

export interface UsuarioAdminResponse {
  id: number;
  username: string;
  nombreCompleto: string;
  email: string;
  rol: string; // Nombre del rol
  juzgado: string; // Nombre o código del juzgado
  activo: boolean;
  bloqueado: boolean;
  intentosFallidos: number;
  debeCambiarPassword: boolean;
  fechaCreacion: string; // ISO date
  fechaModificacion: string; // ISO date
}

export interface UsuarioListaFiltros {
  rolId?: number;
  juzgadoId?: number;
  activo?: boolean;
  bloqueado?: boolean;
  username?: string;
  page?: number;
  size?: number;
  sort?: string;
}
