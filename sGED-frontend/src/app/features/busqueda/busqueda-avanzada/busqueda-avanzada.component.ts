import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TableLazyLoadEvent } from 'primeng/table';
import { AuthService } from '../../../core/services/auth.service';
import { BusquedaExpedientesService } from '../../../core/services/busqueda-expedientes.service';
import { CatalogosService } from '../../../core/services/catalogos.service';
import { AuthUser } from '../../../core/models/auth-user.model';
import { BusquedaAvanzadaRequest, ExpedienteBusquedaResponse } from '../../../core/models/busqueda.model';
import { EstadoExpediente, Juzgado, TipoProceso } from '../../../core/models/catalogos.model';
import { Page } from '../../../core/models/page.model';
import { ResultadosBusquedaComponent } from '../resultados-busqueda/resultados-busqueda.component';

const DEFAULT_SIZE = 10;
const DEFAULT_SORT = 'fechaUltimoMovimiento,desc';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-busqueda-avanzada',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    DatePickerModule,
    SelectModule,
    ButtonModule,
    MessageModule,
    ResultadosBusquedaComponent,
    ResultadosBusquedaComponent
  ],
  templateUrl: './busqueda-avanzada.component.html',
  styleUrls: ['./busqueda-avanzada.component.scss']
})
export class BusquedaAvanzadaComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);

  form = this.fb.group(
    {
      numero: [''],
      fechaDesde: [null as Date | null],
      fechaHasta: [null as Date | null],
      estadoId: [null as number | null],
      tipoProcesoId: [null as number | null],
      juzgadoId: [null as number | null],
      actorPrincipal: [''],
      demandadoPrincipal: [''],
      referenciaSgt: [''],
      fuente: ['TODOS'] // F06: SGT integration
    },
    { validators: [this.dateRangeValidator] }
  );

  resultados?: Page<ExpedienteBusquedaResponse>;
  loading = false;
  showAdvancedFilters = false;
  errorMessages: string[] = [];
  lastFilters: BusquedaAvanzadaRequest | null = null;

  tiposProceso: TipoProceso[] = [];
  estados: EstadoExpediente[] = [];
  juzgados: Juzgado[] = [];
  currentUser: AuthUser | null = null;

  constructor(
    private fb: FormBuilder,
    private busquedaService: BusquedaExpedientesService,
    private catalogosService: CatalogosService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.cargarCatalogos();
  }

  isAdmin(): boolean {
    return this.currentUser?.rol === 'ADMINISTRADOR';
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
    if (!this.lastFilters) {
      return;
    }
    const page = Math.floor((event.first ?? 0) / (event.rows ?? DEFAULT_SIZE));
    const size = event.rows ?? DEFAULT_SIZE;
    const sortField = event.sortField ?? 'fechaUltimoMovimiento';
    const sortDir = event.sortOrder === 1 ? 'asc' : 'desc';
    this.buscar(this.lastFilters, { page, size, sort: `${sortField},${sortDir}` });
  }

  private buildFilters(): BusquedaAvanzadaRequest {
    const raw = this.form.getRawValue();
    const fechaDesde = raw.fechaDesde ? this.toDateString(raw.fechaDesde) : undefined;
    const fechaHasta = raw.fechaHasta ? this.toDateString(raw.fechaHasta) : undefined;
    const juzgadoId = this.isAdmin() ? raw.juzgadoId ?? undefined : this.resolveJuzgadoId();

    return {
      numero: raw.numero?.trim() || undefined,
      fechaDesde,
      fechaHasta,
      estadoId: raw.estadoId ?? undefined,
      tipoProcesoId: raw.tipoProcesoId ?? undefined,
      juzgadoId,
      actorPrincipal: raw.actorPrincipal?.trim() || undefined,
      demandadoPrincipal: raw.demandadoPrincipal?.trim() || undefined,
      referenciaSgt: raw.referenciaSgt?.trim() || undefined,
      fuente: raw.fuente || 'TODOS'
    };
  }

  private buscar(filtros: BusquedaAvanzadaRequest, params: { page: number; size: number; sort?: string }): void {
    this.loading = true;
    this.errorMessages = [];
    this.lastFilters = filtros;
    this.busquedaService.buscarAvanzada(filtros, params).subscribe({
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

  private cargarCatalogos(): void {
    this.catalogosService.getTiposProceso().subscribe({
      next: (response) => { this.tiposProceso = response.data ?? []; this.cdr.markForCheck(); },
      error: () => { this.tiposProceso = []; this.cdr.markForCheck(); }
    });
    this.catalogosService.getEstadosExpediente().subscribe({
      next: (response) => { this.estados = response.data ?? []; this.cdr.markForCheck(); },
      error: () => { this.estados = []; this.cdr.markForCheck(); }
    });
    this.catalogosService.getJuzgados().subscribe({
      next: (response) => {
        this.juzgados = response.data ?? [];
        if (!this.isAdmin()) {
          const juzgadoId = this.resolveJuzgadoId();
          if (juzgadoId) {
            this.form.patchValue({ juzgadoId });
            this.form.get('juzgadoId')?.disable();
          }
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.juzgados = [];
        this.cdr.markForCheck();
      }
    });
  }

  private resolveJuzgadoId(): number | undefined {
    const juzgadoNombre = this.currentUser?.juzgado;
    const juzgado = this.juzgados.find((item) => item.nombre === juzgadoNombre);
    return juzgado?.id;
  }

  private toDateString(date: Date): string {
    return date.toISOString().slice(0, 10);
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

  private dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const desde = control.get('fechaDesde')?.value as Date | null;
    const hasta = control.get('fechaHasta')?.value as Date | null;
    if (!desde || !hasta) {
      return null;
    }
    return desde <= hasta ? null : { dateRange: true };
  }
}
