import { Injectable, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { ExpedientesService } from '../../../core/services/expedientes.service';
import { CatalogosService } from '../../../core/services/catalogos.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadState } from './expedientes-list.types';
import { ExpedientesListDto } from './expedientes-list.dto';

@Injectable()
export class ExpedientesListService {
  private expedientesService = inject(ExpedientesService);
  private catalogosService   = inject(CatalogosService);
  private authService        = inject(AuthService);
  private destroyRef         = inject(DestroyRef);

  public dto = new ExpedientesListDto();

  constructor() {
    this.dto.currentUser.set(this.authService.getCurrentUser());
    this.cargarCatalogos();
    // cargarExpedientes() lo dispara el primer evento onLazyLoad de p-table
  }

  onLazyLoad(event: { first?: number; rows?: number; sortField?: string; sortOrder?: number }): void {
    const rows      = event.rows ?? this.dto.pagination().rows;
    const first     = event.first ?? 0;
    const page      = Math.floor(first / rows);
    const sortField = event.sortField ?? this.dto.pagination().sortField;
    const sortDir   = event.sortOrder === 1 ? ('asc' as const) : ('desc' as const);

    this.dto.pagination.set({ page, rows, first, sortField, sortDir });
    this.cargarExpedientes();
  }

  getTipoProceso(id: number): string {
    return this.dto.tiposProceso().find(t => t.id === id)?.nombre ?? String(id);
  }

  getJuzgado(id: number): string {
    return this.dto.juzgados().find(j => j.id === id)?.nombre ?? String(id);
  }

  private cargarExpedientes(): void {
    const { page, rows, sortField, sortDir } = this.dto.pagination();

    this.dto.state.set(LoadState.Loading);
    this.dto.error.set(null);

    this.expedientesService
      .getExpedientes({ page, size: rows, sort: `${sortField},${sortDir}` })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.dto.expedientes.set(response.data?.content ?? []);
          this.dto.totalRecords.set(response.data?.totalElements ?? 0);
          this.dto.state.set(LoadState.Success);
        },
        error: (err: HttpErrorResponse) => {
          this.dto.expedientes.set([]);
          this.dto.totalRecords.set(0);
          this.dto.error.set(err.error?.message ?? 'Error al cargar expedientes');
          this.dto.state.set(LoadState.Error);
        },
      });
  }

  private cargarCatalogos(): void {
    this.catalogosService.getTiposProceso()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.dto.tiposProceso.set(res.data ?? []),
        error: () => {},
      });

    this.catalogosService.getJuzgados()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.dto.juzgados.set(res.data ?? []),
        error: () => {},
      });
  }
}
