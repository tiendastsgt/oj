import { signal, computed } from '@angular/core';
import { UsuarioAdminResponse, LoadState } from './usuarios-list.types';

export class UsuariosListDto {
  state        = signal<LoadState>(LoadState.Idle);
  isLoading    = computed(() => this.state() === LoadState.Loading);
  hasError     = computed(() => this.state() === LoadState.Error);

  usuarios     = signal<UsuarioAdminResponse[]>([]);
  totalRecords = signal<number>(0);
  currentPage  = signal<number>(0);
  pageSize     = signal<number>(20);
  errorMessage = signal<string>('');
}
