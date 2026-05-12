import { Injectable, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { CatalogosService } from '../../../core/services/catalogos.service';
import { ExpedientesService } from '../../../core/services/expedientes.service';
import { Documento } from '../../documentos/models/documento.model';
import { ExpedienteDetailDto } from './expediente-detail.dto';
import { LoadState } from './expediente-detail.types';

@Injectable()
export class ExpedienteDetailService {
  private readonly expedientesService = inject(ExpedientesService);
  private readonly catalogosService   = inject(CatalogosService);
  private readonly authService        = inject(AuthService);
  private readonly route              = inject(ActivatedRoute);
  private readonly destroyRef         = inject(DestroyRef);

  readonly dto = new ExpedienteDetailDto();
  private readonly currentUser = this.authService.getCurrentUser();

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.dto.state.set(LoadState.Error);
      this.dto.errorMessage.set('Expediente inválido');
      return;
    }
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

  viewDocumento(documento: Documento): void {
    this.dto.selectedDocumento.set(documento);
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
}
