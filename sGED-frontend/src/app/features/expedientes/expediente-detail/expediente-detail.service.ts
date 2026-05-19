import { Injectable, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { AncladosService } from '../../../core/services/anclados.service';
import { CatalogosService } from '../../../core/services/catalogos.service';
import { ExpedientesService } from '../../../core/services/expedientes.service';
import { AuthUser } from '../../../core/models/auth-user.model';
import { OjShellSection, OjShellUser } from '../../../shared/components/oj-shell/oj-shell.types';
import { Documento } from '../../documentos/models/documento.model';
import { ExpedienteDetailDto } from './expediente-detail.dto';
import { ExpedienteTab, LoadState } from './expediente-detail.types';

const NAV_CONSULTA: OjShellSection = {
  label: 'Consulta',
  items: [
    { label: 'Búsqueda de expedientes', icon: 'pi pi-search', route: '/busqueda' }
  ]
};
const NAV_ANALISIS: OjShellSection = {
  label: 'Análisis',
  items: [
    { label: 'Reportes', icon: 'pi pi-chart-bar', route: '/reportes' }
  ]
};
const NAV_ADMIN: OjShellSection = {
  label: 'Administración',
  items: [
    { label: 'Usuarios y roles', icon: 'pi pi-users', route: '/admin/usuarios' },
    { label: 'Auditoría', icon: 'pi pi-history', route: '/admin/auditoria' }
  ]
};

@Injectable()
export class ExpedienteDetailService {
  private readonly expedientesService = inject(ExpedientesService);
  private readonly catalogosService   = inject(CatalogosService);
  private readonly authService        = inject(AuthService);
  private readonly ancladosSvc        = inject(AncladosService);
  private readonly route              = inject(ActivatedRoute);
  private readonly router             = inject(Router);
  private readonly destroyRef         = inject(DestroyRef);

  readonly dto = new ExpedienteDetailDto();
  private readonly currentUser = this.authService.getCurrentUser();

  constructor() {
    const tab = this.route.snapshot.queryParamMap.get('tab');
    if (tab === 'archivos' || tab === 'general') {
      this.dto.mode.set(tab);
    }

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.dto.state.set(LoadState.Error);
      this.dto.errorMessage.set('Expediente inválido');
      return;
    }
    this.initShell();
    this.cargarCatalogos();
    this.cargarExpediente(id);
  }

  canEdit(): boolean {
    return ['ADMINISTRADOR', 'SECRETARIO'].includes(this.currentUser?.rol ?? '');
  }

  getTipoProcesoName(id: number): string {
    return this.dto.tiposProceso().find((t) => t.id === id)?.nombre ?? String(id);
  }

  getEstadoName(id: number): string {
    return this.dto.estados().find((e) => e.id === id)?.nombre ?? String(id);
  }

  getJuzgadoName(id: number): string {
    return this.dto.juzgados().find((j) => j.id === id)?.nombre ?? String(id);
  }

  switchTab(tab: ExpedienteTab): void {
    this.dto.mode.set(tab);
    this.router.navigate([], { relativeTo: this.route, queryParams: { tab }, queryParamsHandling: 'merge', replaceUrl: true });
  }

  viewDocumento(documento: Documento): void {
    this.dto.selectedDocumento.set(documento);
    this.dto.mode.set('archivos');
  }

  closeViewer(): void {
    this.dto.selectedDocumento.set(null);
  }

  setReadingMode(active: boolean): void {
    this.dto.readingModeActive.set(active);
  }

  private cargarExpediente(id: number): void {
    this.dto.state.set(LoadState.Loading);
    this.expedientesService.getExpediente(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.dto.expediente.set(response.data ?? null);
          if (response.data) {
            this.dto.state.set(LoadState.Success);
            this.dto.ancladosCount.set(this.ancladosSvc.countByExpediente(response.data.numero));
          } else {
            this.dto.state.set(LoadState.Error);
            this.dto.errorMessage.set('Expediente no encontrado');
          }
        },
        error: (err: HttpErrorResponse) => {
          this.dto.state.set(LoadState.Error);
          this.dto.errorMessage.set(err.error?.message ?? 'Error al cargar el expediente');
        },
      });
  }

  private cargarCatalogos(): void {
    this.catalogosService.getTiposProceso()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (res) => this.dto.tiposProceso.set(res.data ?? []), error: () => {} });

    this.catalogosService.getEstadosExpediente()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (res) => this.dto.estados.set(res.data ?? []), error: () => {} });

    this.catalogosService.getJuzgados()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (res) => this.dto.juzgados.set(res.data ?? []), error: () => {} });
  }

  private initShell(): void {
    const user = this.currentUser;
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
