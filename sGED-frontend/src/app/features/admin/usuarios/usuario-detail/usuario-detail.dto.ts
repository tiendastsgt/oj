import { signal, computed } from '@angular/core';
import { LoadState, UsuarioAdminResponse } from './usuario-detail.types';

export class UsuarioDetailDto {
  state        = signal<LoadState>(LoadState.Loading);
  isLoading    = computed(() => this.state() === LoadState.Loading);
  hasError     = computed(() => this.state() === LoadState.Error);

  usuario      = signal<UsuarioAdminResponse | null>(null);
  usuarioId    = signal<number | null>(null);
  errorMessage = signal<string>('');

  initials = computed(() => {
    const u = this.usuario();
    if (!u?.nombreCompleto) return '?';
    const parts = u.nombreCompleto.trim().split(/[\s._-]+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : u.nombreCompleto.substring(0, 2).toUpperCase();
  });
}
