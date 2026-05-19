import { signal, computed } from '@angular/core';
import { OjShellBreadcrumbItem, OjShellSection, OjShellUser } from '../../../../shared/components/oj-shell/oj-shell.types';
import { UsuarioAdminResponse, LoadState } from './usuarios-list.types';
import { MOCK_USUARIOS } from '../../../../core/mocks/usuarios.mock';

export class UsuariosListDto {
  state        = signal<LoadState>(LoadState.Idle);
  isLoading    = computed(() => this.state() === LoadState.Loading);
  hasError     = computed(() => this.state() === LoadState.Error);

  usuarios     = signal<UsuarioAdminResponse[]>(MOCK_USUARIOS);
  totalRecords = signal<number>(MOCK_USUARIOS.length);
  currentPage  = signal<number>(0);
  pageSize     = signal<number>(20);
  errorMessage = signal<string>('');

  shellSections = signal<OjShellSection[]>([]);
  shellUser     = signal<OjShellUser | null>(null);

  readonly breadcrumb: OjShellBreadcrumbItem[] = [
    { label: 'Administración' },
    { label: 'Usuarios y roles' }
  ];

  readonly totalActivos   = computed(() => this.usuarios().filter(u => u.activo && !u.bloqueado).length);
  readonly totalInactivos = computed(() => this.usuarios().filter(u => !u.activo).length);
}
