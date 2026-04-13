import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { AuthService } from '../../../core/services/auth.service';
import { CatalogosService } from '../../../core/services/catalogos.service';
import { ExpedientesService } from '../../../core/services/expedientes.service';
import { ExpedienteRequest, ExpedienteResponse } from '../../../core/models/expediente.model';
import { EstadoExpediente, Juzgado, TipoProceso } from '../../../core/models/catalogos.model';
import { AuthUser } from '../../../core/models/auth-user.model';

@Component({
  selector: 'app-expediente-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CardModule,
    InputTextModule,
    TextareaModule,
    DatePickerModule,
    SelectModule,
    ButtonModule,
    MessageModule
  ],
  templateUrl: './expediente-form.component.html',
  styleUrls: ['./expediente-form.component.scss']
})
export class ExpedienteFormComponent implements OnInit {
  form = this.fb.nonNullable.group({
    numero: ['', Validators.required],
    tipoProcesoId: [0, [Validators.required, Validators.min(1)]],
    juzgadoId: [0, [Validators.required, Validators.min(1)]],
    estadoId: [0, [Validators.required, Validators.min(1)]],
    fechaInicio: [null as unknown as Date, Validators.required],
    descripcion: ['', Validators.required],
    observaciones: [''],
    referenciaSgt: [''],
    referenciaFuente: ['']
  });

  loading = false;
  errorMessages: string[] = [];
  successMessage = '';

  tiposProceso: TipoProceso[] = [];
  estados: EstadoExpediente[] = [];
  juzgados: Juzgado[] = [];

  currentUser: AuthUser | null = null;
  expedienteId?: number;

  constructor(
    private fb: FormBuilder,
    private expedientesService: ExpedientesService,
    private catalogosService: CatalogosService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.expedienteId = this.getExpedienteId();
    this.cargarCatalogos();

    if (this.expedienteId) {
      this.cargarExpediente(this.expedienteId);
      this.form.get('numero')?.disable();
    }
  }

  isEditMode(): boolean {
    return Boolean(this.expedienteId);
  }

  isAdmin(): boolean {
    return this.currentUser?.rol === 'ADMINISTRADOR';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.isAdmin() && this.resolveJuzgadoId() === 0) {
      this.errorMessages = ['No se pudo determinar el juzgado del usuario'];
      return;
    }

    this.loading = true;
    this.errorMessages = [];
    this.successMessage = '';

    const payload = this.buildPayload();
    const request$ = this.isEditMode()
      ? this.expedientesService.updateExpediente(this.expedienteId as number, payload)
      : this.expedientesService.createExpediente(payload);

    request$.subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = response.message ?? 'Operación realizada correctamente';
        const id = response.data?.id ?? this.expedienteId;
        if (id) {
          this.router.navigate(['/expedientes', id]);
        } else {
          this.router.navigate(['/expedientes']);
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessages = this.parseErrors(error);
      }
    });
  }

  isInvalid(controlName: keyof ExpedienteRequest): boolean {
    const control = this.form.get(controlName);
    return Boolean(control && control.touched && control.invalid);
  }

  private buildPayload(): ExpedienteRequest {
    const raw = this.form.getRawValue();
    const fechaInicio = raw.fechaInicio instanceof Date
      ? raw.fechaInicio.toISOString().slice(0, 10)
      : raw.fechaInicio;

    let juzgadoId = raw.juzgadoId;
    if (!this.isAdmin()) {
      juzgadoId = this.resolveJuzgadoId();
    }

    return {
      numero: raw.numero,
      tipoProcesoId: Number(raw.tipoProcesoId),
      juzgadoId: Number(juzgadoId),
      estadoId: Number(raw.estadoId),
      fechaInicio,
      descripcion: raw.descripcion,
      observaciones: raw.observaciones?.trim() || null as any,
      referenciaSgt: raw.referenciaSgt?.trim() || null as any,
      referenciaFuente: raw.referenciaFuente?.trim() || null as any
    };
  }

  private cargarExpediente(id: number): void {
    this.loading = true;
    this.expedientesService.getExpediente(id).subscribe({
      next: (response) => {
        this.loading = false;
        const data = response.data;
        if (data) {
          this.patchForm(data);
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessages = [error?.error?.message ?? 'No se pudo cargar el expediente'];
      }
    });
  }

  private cargarCatalogos(): void {
    this.catalogosService.getTiposProceso().subscribe({
      next: (response) => (this.tiposProceso = response.data ?? []),
      error: () => (this.tiposProceso = [])
    });
    this.catalogosService.getEstadosExpediente().subscribe({
      next: (response) => (this.estados = response.data ?? []),
      error: () => (this.estados = [])
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
      },
      error: () => {
        this.juzgados = [];
        if (!this.isAdmin()) {
          this.errorMessages = ['No se pudo determinar el juzgado del usuario'];
        }
      }
    });
  }

  private patchForm(expediente: ExpedienteResponse): void {
    this.form.patchValue({
      numero: expediente.numero,
      tipoProcesoId: expediente.tipoProcesoId,
      juzgadoId: expediente.juzgadoId,
      estadoId: expediente.estadoId,
      fechaInicio: new Date(expediente.fechaInicio),
      descripcion: expediente.descripcion,
      observaciones: expediente.observaciones ?? '',
      referenciaSgt: expediente.referenciaSgt ?? '',
      referenciaFuente: expediente.referenciaFuente ?? ''
    });
    if (!this.isAdmin()) {
      this.form.get('juzgadoId')?.disable();
    }
  }

  private getExpedienteId(): number | undefined {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    return Number.isNaN(id) ? undefined : id;
  }

  private resolveJuzgadoId(): number {
    const juzgadoNombre = this.currentUser?.juzgado;
    const juzgado = this.juzgados.find((item) => item.nombre === juzgadoNombre);
    return juzgado?.id ?? 0;
  }

  private parseErrors(error: unknown): string[] {
    const payload = (error as { error?: { errors?: unknown; message?: string } })?.error;
    if (payload?.errors && Array.isArray(payload.errors)) {
      return payload.errors.map((entry) => String(entry));
    }
    if (payload?.message) {
      return [payload.message];
    }
    return ['No se pudo guardar el expediente'];
  }
}
