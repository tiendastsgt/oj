import { inject, Injectable, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { BusquedaExpedientesService } from '../../../core/services/busqueda-expedientes.service';
import { TableLazyLoadEvent } from 'primeng/table';
import { BusquedaRapidaDto } from './busqueda-rapida.dto';
import { BusquedaParams, DEFAULT_SIZE, DEFAULT_SORT } from './busqueda-rapida.types';

@Injectable()
export class BusquedaRapidaService {
  private readonly busquedaService = inject(BusquedaExpedientesService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly dto = new BusquedaRapidaDto();

  readonly form = this.fb.nonNullable.group({
    numero: ['', Validators.required]
  });

  private lastQuery = '';
  private lastParams: BusquedaParams = { page: 0, size: DEFAULT_SIZE, sort: DEFAULT_SORT };

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.lastQuery = this.form.getRawValue().numero.trim();
    this.buscar(this.lastQuery, { page: 0, size: DEFAULT_SIZE, sort: DEFAULT_SORT });
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    if (!this.lastQuery) return;
    const page = Math.floor((event.first ?? 0) / (event.rows ?? DEFAULT_SIZE));
    const size = event.rows ?? DEFAULT_SIZE;
    const sortField = event.sortField ?? 'fechaUltimoMovimiento';
    const sortDir = event.sortOrder === 1 ? 'asc' : 'desc';
    this.buscar(this.lastQuery, { page, size, sort: `${sortField},${sortDir}` });
  }

  private buscar(numero: string, params: BusquedaParams): void {
    this.dto.loading.set(true);
    this.dto.errorMessages.set([]);
    this.lastParams = params;
    this.busquedaService.buscarRapida(numero, params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.dto.resultados.set(response.data);
          this.dto.loading.set(false);
        },
        error: (error) => {
          this.dto.loading.set(false);
          this.dto.errorMessages.set(this.parseErrors(error));
        }
      });
  }

  private parseErrors(error: unknown): string[] {
    const payload = (error as { error?: { errors?: unknown; message?: string } })?.error;
    if (payload?.errors && Array.isArray(payload.errors)) {
      return payload.errors.map((entry) => String(entry));
    }
    if (payload?.message) return [payload.message];
    return ['No se pudo completar la búsqueda'];
  }
}
