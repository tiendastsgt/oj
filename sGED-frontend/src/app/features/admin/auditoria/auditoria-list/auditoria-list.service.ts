import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AuditoriaService } from '../../../../core/services/auditoria.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthUser } from '../../../../core/models/auth-user.model';
import { OjShellSection, OjShellUser } from '../../../../shared/components/oj-shell/oj-shell.types';
import { AuditoriaListDto } from './auditoria-list.dto';
import { AuditoriaFiltros, AuditoriaResponse, LoadState } from './auditoria-list.types';

const NAV_CONSULTA: OjShellSection = {
  label: 'Consulta',
  items: [
    { label: 'Búsqueda de expedientes', icon: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>', route: '/busqueda' }
  ]
};
const NAV_ANALISIS: OjShellSection = {
  label: 'Análisis',
  items: [
    { label: 'Reportes', icon: '<svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-5"/></svg>', route: '/reportes' }
  ]
};
const NAV_ADMIN: OjShellSection = {
  label: 'Administración',
  items: [
    { label: 'Usuarios y roles', icon: '<svg viewBox="0 0 24 24"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><circle cx="17" cy="7" r="3"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/></svg>', route: '/admin/usuarios' },
    { label: 'Auditoría', icon: '<svg viewBox="0 0 24 24"><path d="M3 3h18v4H3zM3 10h18v4H3zM3 17h18v4H3z"/></svg>', route: '/admin/auditoria' }
  ]
};

@Injectable()
export class AuditoriaListService {
  private readonly destroyRef   = inject(DestroyRef);
  private readonly auditoriaApi = inject(AuditoriaService);
  private readonly authSvc      = inject(AuthService);
  private readonly msgSvc       = inject(MessageService);
  private readonly fb           = inject(FormBuilder);

  readonly dto = new AuditoriaListDto();

  readonly filterForm: FormGroup = this.fb.group({
    usuario:    [''],
    modulo:     [''],
    accion:     [''],
    recursoId:  [null],
    fechaDesde: [null],
    fechaHasta: [null]
  });

  constructor() {
    this.initShell();
    this.cargarAuditoria();
  }

  getDotColor(modulo: string): string {
    switch (modulo.toLowerCase()) {
      case 'auth':        return '#4ade80';
      case 'expedientes': return '#60a5fa';
      case 'documentos':  return '#fbbf24';
      case 'security':    return '#f87171';
      default:            return '#9ca3af';
    }
  }

  getActivityIcon(modulo: string): string {
    switch (modulo.toLowerCase()) {
      case 'auth':        return 'pi-sign-in';
      case 'expedientes': return 'pi-folder';
      case 'documentos':  return 'pi-file-pdf';
      case 'security':    return 'pi-shield';
      default:            return 'pi-info-circle';
    }
  }

  cargarAuditoria(page = 0): void {
    this.dto.state.set(LoadState.Loading);

    const fechaDesde = this.filterForm.get('fechaDesde')?.value;
    const fechaHasta = this.filterForm.get('fechaHasta')?.value;

    const filtros: AuditoriaFiltros = {
      usuario:    this.filterForm.get('usuario')?.value  || undefined,
      modulo:     this.filterForm.get('modulo')?.value   || undefined,
      accion:     this.filterForm.get('accion')?.value   || undefined,
      recursoId:  this.filterForm.get('recursoId')?.value || undefined,
      fechaDesde: fechaDesde ? new Date(fechaDesde).toISOString() : undefined,
      fechaHasta: fechaHasta ? new Date(fechaHasta).toISOString() : undefined,
      page,
      size: this.dto.pageSize(),
      sort: 'fecha,desc'
    };

    this.auditoriaApi
      .getAuditoria(filtros)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          if (response.data?.content) {
            this.dto.auditoria.set(response.data.content);
            this.dto.totalRecords.set(response.data.pageable?.totalElements || 0);
            this.dto.currentPage.set(page);
          }
          this.dto.state.set(LoadState.Success);
        },
        error: (err: any) => {
          this.dto.state.set(LoadState.Error);
          this.msgSvc.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Error al cargar auditoría'
          });
        }
      });
  }

  onLazyLoad(event: any): void {
    const page = event.first ? event.first / event.rows : 0;
    this.cargarAuditoria(page);
  }

  aplicarFiltros(): void {
    this.cargarAuditoria(0);
  }

  countByModulo(keyword: string): number {
    return this.dto.auditoria().filter(
      a => a.modulo.toLowerCase().includes(keyword.toLowerCase())
    ).length;
  }

  getResourceLabel(item: AuditoriaResponse): string {
    if (!item.recursoId) return '';
    const mod = item.modulo.toLowerCase();
    if (mod.includes('expediente')) return `Expediente #${item.recursoId}`;
    if (mod.includes('documento'))  return `Documento #${item.recursoId}`;
    return `Recurso #${item.recursoId}`;
  }

  getActionClass(modulo: string): string {
    switch (modulo.toLowerCase()) {
      case 'auth':        return 'action-login';
      case 'expedientes': return 'action-view';
      case 'documentos':  return 'action-doc';
      case 'security':    return 'action-danger';
      default:            return 'action-default';
    }
  }

  private initShell(): void {
    const user = this.authSvc.getCurrentUser();
    if (user) {
      this.dto.shellUser.set(this.toShellUser(user));
      this.dto.shellSections.set(this.buildSections(user));
    }
  }

  private toShellUser(user: AuthUser): OjShellUser {
    const parts = user.nombreCompleto.trim().split(' ');
    const initials = parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : user.nombreCompleto.slice(0, 2).toUpperCase();
    return { name: user.nombreCompleto, role: user.rol, initials };
  }

  private buildSections(user: AuthUser): OjShellSection[] {
    const sections: OjShellSection[] = [NAV_CONSULTA, NAV_ANALISIS];
    if (user.rol === 'ADMINISTRADOR') sections.push(NAV_ADMIN);
    return sections;
  }
}
