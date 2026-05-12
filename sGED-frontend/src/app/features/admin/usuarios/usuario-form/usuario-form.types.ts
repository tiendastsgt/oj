export { CrearUsuarioRequest, ActualizarUsuarioRequest, UsuarioAdminResponse } from '../../../../core/models/admin-usuarios.model';

export interface RolOption     { label: string; value: number; }
export interface JuzgadoOption { label: string; value: number; }

export enum LoadState { Idle = 'Idle', Loading = 'Loading', Success = 'Success', Error = 'Error' }
