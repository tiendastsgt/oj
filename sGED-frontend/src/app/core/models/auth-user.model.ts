export type RolUsuario = 'ADMINISTRADOR' | 'SECRETARIO' | 'AUXILIAR' | 'CONSULTA';

export interface AuthUser {
  username: string;
  nombreCompleto: string;
  rol: RolUsuario;
  juzgado?: string;
  debeCambiarPassword: boolean;
}
