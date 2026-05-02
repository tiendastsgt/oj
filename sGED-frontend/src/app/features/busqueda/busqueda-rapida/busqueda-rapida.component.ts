import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { BusquedaExpedientesService } from '../../../core/services/busqueda-expedientes.service';
import { ExpedienteBusquedaResponse } from '../../../core/models/busqueda.model';
import { Page } from '../../../core/models/page.model';
import { ResultadosBusquedaComponent } from '../resultados-busqueda/resultados-busqueda.component';
import { TableLazyLoadEvent } from 'primeng/table';

const DEFAULT_SIZE = 10;
const DEFAULT_SORT = 'fechaUltimoMovimiento,desc';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-busqueda-rapida',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, InputTextModule, ButtonModule, MessageModule, ResultadosBusquedaComponent],
  templateUrl: './busqueda-rapida.component.html',
  styleUrls: ['./busqueda-rapida.component.scss']
})
export class BusquedaRapidaComponent {
  private readonly cdr = inject(ChangeDetectorRef);

  form = this.fb.nonNullable.group({
    numero: ['', Validators.required]
  });

  resultados?: Page<ExpedienteBusquedaResponse>;
  loading = false;
  errorMessages: string[] = [];
  lastQuery = '';
  lastParams: { page: number; size: number; sort?: string } = {
    page: 0,
    size: DEFAULT_SIZE,
    sort: DEFAULT_SORT
  };

  constructor(private fb: FormBuilder, private busquedaService: BusquedaExpedientesService) {}

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.lastQuery = this.form.getRawValue().numero.trim();
    this.buscar(this.lastQuery, { page: 0, size: DEFAULT_SIZE, sort: DEFAULT_SORT });
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    if (!this.lastQuery) {
      return;
    }
    const page = Math.floor((event.first ?? 0) / (event.rows ?? DEFAULT_SIZE));
    const size = event.rows ?? DEFAULT_SIZE;
    const sortField = event.sortField ?? 'fechaUltimoMovimiento';
    const sortDir = event.sortOrder === 1 ? 'asc' : 'desc';
    this.buscar(this.lastQuery, { page, size, sort: `${sortField},${sortDir}` });
  }

  private buscar(numero: string, params: { page: number; size: number; sort?: string }): void {
    this.loading = true;
    this.errorMessages = [];
    this.lastParams = params;
    this.busquedaService.buscarRapida(numero, params).subscribe({
      next: (response) => {
        this.resultados = response.data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessages = this.parseErrors(error);
        this.cdr.markForCheck();
      }
    });
  }

  private parseErrors(error: unknown): string[] {
    const payload = (error as { error?: { errors?: unknown; message?: string } })?.error;
    if (payload?.errors && Array.isArray(payload.errors)) {
      return payload.errors.map((entry) => String(entry));
    }
    if (payload?.message) {
      return [payload.message];
    }
    return ['No se pudo completar la búsqueda'];
  }
}
