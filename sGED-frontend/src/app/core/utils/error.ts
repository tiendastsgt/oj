import { HttpErrorResponse } from '@angular/common/http';

export function formatError(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0)   return 'Sin conexión al servidor';
    if (err.status === 400) return err.error?.message ?? 'Solicitud inválida';
    if (err.status === 401) return 'No autorizado';
    if (err.status === 403) return 'No tienes permisos';
    if (err.status === 404) return 'Recurso no encontrado';
    if (err.status === 422) return err.error?.message ?? 'Datos inválidos';
    if (err.status >= 500)  return 'Error del servidor';
    return err.error?.message ?? err.message;
  }

  if (err instanceof Error) return err.message;
  return 'Ocurrió un error inesperado';
}
