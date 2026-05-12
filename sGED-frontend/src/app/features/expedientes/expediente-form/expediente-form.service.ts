import { Injectable, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { CatalogosService } from '../../../core/services/catalogos.service';
import { ExpedientesService } from '../../../core/services/expedientes.service';
import { ExpedienteRequest, ExpedienteResponse } from '../../../core/models/expediente.model';
import { ExpedienteFormDto } from './expediente-form.dto';
import { LoadState } from './expediente-form.types';

@Injectable()
export class ExpedienteFormService {
  private readonly fb                 = inject(FormBuilder);
  private readonly expedientesService = inject(ExpedientesService);
  private readonly catalogosService   = inject(CatalogosService);
  private readonly authService        = inject(AuthService);
  private readonly route              = inject(ActivatedRoute);
  private readonly router             = inject(Router);
  private readonly destroyRef         = inject(DestroyRef);

  readonly dto = new ExpedienteFormDto();
  private readonly currentUser = this.authService.getCurrentUser();
  private expedienteId?: number;

  readonly form = this.fb.nonNullable.group({
    numero:           ['', Validators.required],
    tipoProcesoId:    [0, [Validators.required, Validators.min(1)]],
    juzgadoId:        [0, [Validators.required, Validators.min(1)]],
    estadoId:         [0, [Validators.required, Validators.min(1)]],
    fechaInicio:      [null as unknown as Date, Validators.required],
    descripcion:      ['', Validators.required],
    observaciones:    [''],
    referenciaSgt:    [''],
    referenciaFuente: [''],
  });

  constructor() {
    this.expedienteId = this.resolveRouteId();
    if (this.expedienteId) {
      this.dto.mode.set('edit');
      this.form.get('numero')?.disable();
      this.cargarExpediente(this.expedienteId);
    }
    this.cargarCatalogos();
  }

  isAdmin(): boolean {
    return this.currentUser?.rol === 'ADMINISTRADOR';
  }

  isInvalid(controlName: keyof ExpedienteRequest): boolean {
    const c = this.form.get(controlName);
    return Boolean(c?.touched && c?.invalid);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.isAdmin() && this.resolveJuzgadoId() === 0) {
      this.dto.errors.set(['No se pudo determinar el juzgado del usuario']);
      return;
    }

    this.dto.state.set(LoadState.Loading);
    this.dto.errors.set([]);
    this.dto.successMessage.set('');

    const payload = this.buildPayload();
    const request$ = this.dto.isEditMode()
      ? this.expedientesService.updateExpediente(this.expedienteId as number, payload)
      : this.expedientesService.createExpediente(payload);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.dto.state.set(LoadState.Success);
        this.dto.successMessage.set(response.message ?? 'Operación realizada correctamente');
        const id = response.data?.id ?? this.expedienteId;
        if (id) {
          this.router.navigate(['/expedientes', id]);
        } else {
          this.router.navigate(['/expedientes']);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.dto.state.set(LoadState.Error);
        this.dto.errors.set(this.parseErrors(error));
      },
    });
  }

  private buildPayload(): ExpedienteRequest {
    const raw = this.form.getRawValue();
    const fechaInicio = raw.fechaInicio instanceof Date
      ? raw.fechaInicio.toISOString().slice(0, 10)
      : raw.fechaInicio;

    return {
      numero:           raw.numero,
      tipoProcesoId:    Number(raw.tipoProcesoId),
      juzgadoId:        Number(this.isAdmin() ? raw.juzgadoId : this.resolveJuzgadoId()),
      estadoId:         Number(raw.estadoId),
      fechaInicio,
      descripcion:      raw.descripcion,
      observaciones:    raw.observaciones?.trim()    || (null as unknown as string),
      referenciaSgt:    raw.referenciaSgt?.trim()    || (null as unknown as string),
      referenciaFuente: raw.referenciaFuente?.trim() || (null as unknown as string),
    };
  }

  private cargarExpediente(id: number): void {
    this.dto.state.set(LoadState.Loading);
    this.expedientesService.getExpediente(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.dto.state.set(LoadState.Idle);
          if (response.data) { this.patchForm(response.data); }
        },
        error: (err: HttpErrorResponse) => {
          this.dto.state.set(LoadState.Error);
          this.dto.errors.set([err.error?.message ?? 'No se pudo cargar el expediente']);
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

    this.catalogosService.getEstadosExpediente()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.dto.estados.set(res.data ?? []),
        error: () => {},
      });

    this.catalogosService.getJuzgados()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.dto.juzgados.set(res.data ?? []);
          if (!this.isAdmin()) {
            const juzgadoId = this.resolveJuzgadoId();
            if (juzgadoId) {
              this.form.patchValue({ juzgadoId });
              this.form.get('juzgadoId')?.disable();
            }
          }
        },
        error: () => {
          if (!this.isAdmin()) {
            this.dto.errors.set(['No se pudo determinar el juzgado del usuario']);
          }
        },
      });
  }

  private patchForm(expediente: ExpedienteResponse): void {
    this.form.patchValue({
      numero:           expediente.numero,
      tipoProcesoId:    expediente.tipoProcesoId,
      juzgadoId:        expediente.juzgadoId,
      estadoId:         expediente.estadoId,
      fechaInicio:      new Date(expediente.fechaInicio as string),
      descripcion:      expediente.descripcion,
      observaciones:    expediente.observaciones   ?? '',
      referenciaSgt:    expediente.referenciaSgt   ?? '',
      referenciaFuente: expediente.referenciaFuente ?? '',
    });
    if (!this.isAdmin()) {
      this.form.get('juzgadoId')?.disable();
    }
  }

  private resolveRouteId(): number | undefined {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    return Number.isNaN(id) || id === 0 ? undefined : id;
  }

  private resolveJuzgadoId(): number {
    const nombre = this.currentUser?.juzgado;
    return this.dto.juzgados().find((j) => j.nombre === nombre)?.id ?? 0;
  }

  private parseErrors(error: unknown): string[] {
    const payload = (error as { error?: { errors?: unknown; message?: string } })?.error;
    if (payload?.errors && Array.isArray(payload.errors)) {
      return (payload.errors as unknown[]).map(String);
    }
    if (payload?.message) { return [payload.message]; }
    return ['No se pudo guardar el expediente'];
  }
}
