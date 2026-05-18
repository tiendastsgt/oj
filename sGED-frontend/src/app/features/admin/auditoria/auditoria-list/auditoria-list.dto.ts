import { computed, signal } from '@angular/core';
import { OjShellBreadcrumbItem, OjShellSection, OjShellUser } from '../../../../shared/components/oj-shell/oj-shell.types';
import { AuditoriaResponse, LoadState } from './auditoria-list.types';

export class AuditoriaListDto {
  state        = signal<LoadState>(LoadState.Idle);
  isLoading    = computed(() => this.state() === LoadState.Loading);
  hasError     = computed(() => this.state() === LoadState.Error);

  auditoria    = signal<AuditoriaResponse[]>([]);
  totalRecords = signal<number>(0);
  currentPage  = signal<number>(0);
  pageSize     = signal<number>(50);
  errorMessage = signal<string>('');
  now          = signal<Date>(new Date());

  shellSections = signal<OjShellSection[]>([]);
  shellUser     = signal<OjShellUser | null>(null);

  readonly breadcrumb: OjShellBreadcrumbItem[] = [
    { label: 'Administración' },
    { label: 'Auditoría' }
  ];
}
