import { DestroyRef, Injectable, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors } from '@angular/forms';
import { TableLazyLoadEvent } from 'primeng/table';
import { AuthService } from '../../../core/services/auth.service';
import { BusquedaExpedientesService } from '../../../core/services/busqueda-expedientes.service';
import { CatalogosService } from '../../../core/services/catalogos.service';
import { BusquedaAvanzadaDto } from './busqueda-avanzada.dto';
import { BusquedaAvanzadaRequest, LoadState } from './busqueda-avanzada.types';

const DEFAULT_SIZE = 10;
const DEFAULT_SORT = 'fechaUltimoMovimiento,desc';

@Injectable()
export class BusquedaAvanzadaService {
  private readonly destroyRef   = inject(DestroyRef);
  private readonly fb           = inject(FormBuilder);
  private readonly busquedaApi  = inject(BusquedaExpedientesService);
  private readonly catalogosApi = inject(CatalogosService);
  private readonly authSvc      = inject(AuthService);

  readonly dto = new BusquedaAvanzadaDto();

  readonly form = this.fb.group(
    {
      numero:             [''],
      fechaDesde:         [null as Date | null],
      fechaHasta:         [null as Date | null],
      estadoId:           [null as number | null],
      tipoProcesoId:      [null as number | null],
      juzgadoId:          [null as number | null],
      actorPrincipal:     [''],
      demandadoPrincipal: [''],
      referenciaSgt:      [''],
      fuente:             ['TODOS']
    },
    { validators: [this.dateRangeValidator] }
  );

  constructor() {
    this.dto.currentUser.set(this.authSvc.getCurrentUser());
    this.cargarCatalogos();
  }

  isAdmin(): boolean {
    return this.dto.currentUser()?.rol === 'ADMINISTRADOR';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const filtros = this.buildFilters();
    this.buscar(filtros, { page: 0, size: DEFAULT_SIZE, sort: DEFAULT_SORT });
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    if (!this.dto.lastFilters()) return;
    const page      = Math.floor((event.first ?? 0) / (event.rows ?? DEFAULT_SIZE));
    const size      = event.rows ?? DEFAULT_SIZE;
    const sortField = event.sortField ?? 'fechaUltimoMovimiento';
    const sortDir   = event.sortOrder === 1 ? 'asc' : 'desc';
    this.buscar(this.dto.lastFilters()!, { page, size, sort: `${sortField},${sortDir}` });
  }

  toggleAdvancedFilters(): void {
    this.dto.showAdvancedFilters.update(v => !v);
  }

  private buildFilters(): BusquedaAvanzadaRequest {
    const raw = this.form.getRawValue();
    return {
      numero:             raw.numero?.trim()             || undefined,
      fechaDesde:         raw.fechaDesde  ? this.toDateString(raw.fechaDesde)  : undefined,
      fechaHasta:         raw.fechaHasta  ? this.toDateString(raw.fechaHasta)  : undefined,
      estadoId:           raw.estadoId    ?? undefined,
      tipoProcesoId:      raw.tipoProcesoId ?? undefined,
      juzgadoId:          this.isAdmin()  ? raw.juzgadoId ?? undefined : this.resolveJuzgadoId(),
      actorPrincipal:     raw.actorPrincipal?.trim()     || undefined,
      demandadoPrincipal: raw.demandadoPrincipal?.trim() || undefined,
      referenciaSgt:      raw.referenciaSgt?.trim()      || undefined,
      fuente:             raw.fuente || 'TODOS'
    };
  }

  private buscar(
    filtros: BusquedaAvanzadaRequest,
    params: { page: number; size: number; sort?: string }
  ): void {
    this.dto.state.set(LoadState.Loading);
    this.dto.errorMessages.set([]);
    this.dto.lastFilters.set(filtros);
    this.busquedaApi.buscarAvanzada(filtros, params).subscribe({
      next: (response) => {
        this.dto.resultados.set(response.data);
        this.dto.state.set(LoadState.Success);
      },
      error: (error) => {
        this.dto.state.set(LoadState.Error);
        this.dto.errorMessages.set(this.parseErrors(error));
      }
    });
  }

  private cargarCatalogos(): void {
    this.catalogosApi.getTiposProceso().subscribe({
      next: (r) => this.dto.tiposProceso.set(r.data ?? []),
      error: () => this.dto.tiposProceso.set([])
    });
    this.catalogosApi.getEstadosExpediente().subscribe({
      next: (r) => this.dto.estados.set(r.data ?? []),
      error: () => this.dto.estados.set([])
    });
    this.catalogosApi.getJuzgados().subscribe({
      next: (r) => {
        this.dto.juzgados.set(r.data ?? []);
        if (!this.isAdmin()) {
          const juzgadoId = this.resolveJuzgadoId();
          if (juzgadoId) {
            this.form.patchValue({ juzgadoId });
            this.form.get('juzgadoId')?.disable();
          }
        }
      },
      error: () => this.dto.juzgados.set([])
    });
  }

  private resolveJuzgadoId(): number | undefined {
    const nombre  = this.dto.currentUser()?.juzgado;
    const juzgado = this.dto.juzgados().find(j => j.nombre === nombre);
    return juzgado?.id;
  }

  private toDateString(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private parseErrors(error: unknown): string[] {
    const payload = (error as { error?: { errors?: unknown; message?: string } })?.error;
    if (payload?.errors && Array.isArray(payload.errors)) {
      return payload.errors.map(e => String(e));
    }
    if (payload?.message) return [payload.message];
    return ['No se pudo completar la búsqueda'];
  }

  private dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const desde = control.get('fechaDesde')?.value as Date | null;
    const hasta  = control.get('fechaHasta')?.value as Date | null;
    if (!desde || !hasta) return null;
    return desde <= hasta ? null : { dateRange: true };
  }
}
