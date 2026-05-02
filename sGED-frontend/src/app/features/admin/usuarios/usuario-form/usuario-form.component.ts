import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { AdminUsuariosService } from '../../../../core/services/admin-usuarios.service';
import {
  ActualizarUsuarioRequest,
  CrearUsuarioRequest,
  UsuarioAdminResponse
} from '../../../../core/models/admin-usuarios.model';
import { CatalogosService } from '../../../../core/services/catalogos.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-usuario-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    CardModule
  ],
  providers: [MessageService],
  template: `
    <div class="fade-in">
      <!-- Page Header -->
      <div class="page-header-actions mb-6">
        <div>
          <h1 class="page-title">{{ isCreation ? 'Crear Nuevo Usuario' : 'Editar Usuario' }}</h1>
          <p class="subtitle">{{ isCreation ? 'Complete los datos para registrar una nueva cuenta' : 'Modifique los datos del usuario seleccionado' }}</p>
        </div>
        <button class="btn btn-secondary" (click)="cancelar()">
          <i class="pi pi-arrow-left"></i> Volver
        </button>
      </div>

      <div class="card glass-panel shadow-lg" style="max-width: 800px;">
        <div class="card-header">
          <div class="section-title">
            <i class="pi pi-user-edit"></i> {{ isCreation ? 'DATOS DE LA CUENTA' : 'DATOS DEL USUARIO' }}
          </div>
        </div>
        <div class="card-body" style="padding: var(--space-6);">
          <form [formGroup]="form" (ngSubmit)="guardar()">
            <!-- Username (solo en creación) -->
            @if (isCreation) {
            <div class="form-field mb-4">
              <label class="form-label" htmlFor="username"><i class="pi pi-at"></i> Username *</label>
              <input
                type="text"
                id="username"
                class="form-input"
                placeholder="Ej: juan.perez"
                formControlName="username"
              />
              @if (isFieldInvalid('username')) {
              <div class="text-red-500 text-sm mt-1">
                @if (form.get('username')?.errors?.['required']) {
                <span>El username es requerido</span>
                }
                @if (form.get('username')?.errors?.['minlength']) {
                <span>Mínimo 3 caracteres</span>
                }
                @if (form.get('username')?.errors?.['maxlength']) {
                <span>Máximo 50 caracteres</span>
                }
              </div>
              }
            </div>
            }

            <!-- Nombre Completo -->
            <div class="form-field mb-4">
              <label class="form-label" htmlFor="nombreCompleto"><i class="pi pi-user"></i> Nombre Completo *</label>
              <input
                type="text"
                id="nombreCompleto"
                class="form-input"
                placeholder="Nombre y apellidos"
                formControlName="nombreCompleto"
              />
              @if (isFieldInvalid('nombreCompleto')) {
              <div class="text-red-500 text-sm mt-1">
                @if (form.get('nombreCompleto')?.errors?.['required']) {
                <span>El nombre completo es requerido</span>
                }
                @if (form.get('nombreCompleto')?.errors?.['minlength']) {
                <span>Mínimo 5 caracteres</span>
                }
                @if (form.get('nombreCompleto')?.errors?.['maxlength']) {
                <span>Máximo 150 caracteres</span>
                }
              </div>
              }
            </div>

            <!-- Email -->
            <div class="form-field mb-4">
              <label class="form-label" htmlFor="email"><i class="pi pi-envelope"></i> Email *</label>
              <input
                type="email"
                id="email"
                class="form-input"
                placeholder="correo@oj.gob.gt"
                formControlName="email"
              />
              @if (isFieldInvalid('email')) {
              <div class="text-red-500 text-sm mt-1">
                @if (form.get('email')?.errors?.['required']) {
                <span>El email es requerido</span>
                }
                @if (form.get('email')?.errors?.['email']) {
                <span>Email inválido</span>
                }
                @if (form.get('email')?.errors?.['maxlength']) {
                <span>Máximo 100 caracteres</span>
                }
              </div>
              }
            </div>

            <!-- Grid: Rol + Juzgado -->
            <div class="grid-2 mb-4">
              <div class="form-field">
                <label class="form-label" htmlFor="rolId"><i class="pi pi-shield"></i> Rol *</label>
                <select
                  id="rolId"
                  formControlName="rolId"
                  class="form-input form-select"
                >
                  <option value="">Seleccionar rol</option>
                  @for (rol of roles; track rol.value) {
                  <option [value]="rol.value">{{ rol.label }}</option>
                  }
                </select>
                @if (isFieldInvalid('rolId')) {
                <div class="text-red-500 text-sm mt-1">
                  @if (form.get('rolId')?.errors?.['required']) {
                  <span>El rol es requerido</span>
                  }
                </div>
                }
              </div>
              <div class="form-field">
                <label class="form-label" htmlFor="juzgadoId"><i class="pi pi-building"></i> Juzgado *</label>
                <select
                  id="juzgadoId"
                  formControlName="juzgadoId"
                  class="form-input form-select"
                >
                  <option value="">Seleccionar juzgado</option>
                  @for (juzgado of juzgados; track juzgado.value) {
                  <option [value]="juzgado.value">{{ juzgado.label }}</option>
                  }
                </select>
                @if (isFieldInvalid('juzgadoId')) {
                <div class="text-red-500 text-sm mt-1">
                  @if (form.get('juzgadoId')?.errors?.['required']) {
                  <span>El juzgado es requerido</span>
                  }
                </div>
                }
              </div>
            </div>

            <!-- Grid: Activo + Bloqueado (solo en edición) -->
            @if (!isCreation) {
            <div class="grid-2 mb-6">
              <div class="form-field">
                <label class="form-label" htmlFor="activo"><i class="pi pi-check-circle"></i> Estado</label>
                <select
                  id="activo"
                  formControlName="activo"
                  class="form-input form-select"
                >
                  <option [value]="true">Activo</option>
                  <option [value]="false">Inactivo</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label" htmlFor="bloqueado"><i class="pi pi-lock"></i> Bloqueo</label>
                <select
                  id="bloqueado"
                  formControlName="bloqueado"
                  class="form-input form-select"
                >
                  <option [value]="false">Desbloqueado</option>
                  <option [value]="true">Bloqueado</option>
                </select>
              </div>
            </div>
            }

            <!-- Botones -->
            <div class="flex gap-3" style="border-top: 1px solid var(--border); padding-top: var(--space-6);">
              <button type="submit" class="btn btn-primary" [disabled]="!form.valid || loading">
                <i class="pi" [ngClass]="loading ? 'pi-spin pi-spinner' : 'pi-check'"></i>
                {{ isCreation ? 'Crear Usuario' : 'Guardar Cambios' }}
              </button>
              <button type="button" class="btn btn-secondary" (click)="cancelar()">
                <i class="pi pi-times"></i> Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <p-toast></p-toast>
  `,
  styles: [`
    .page-header-actions {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .text-red-500 {
      color: var(--accent-rose);
    }
    .text-sm {
      font-size: var(--font-xs);
    }
    .mt-1 {
      margin-top: var(--space-1);
    }
  `]
})
export class UsuarioFormComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  form: FormGroup;
  loading = false;
  isCreation = true;
  usuarioId: number | null = null;
  roles: { label: string; value: number }[] = [];
  juzgados: { label: string; value: number }[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminUsuariosService: AdminUsuariosService,
    private messageService: MessageService,
    private catalogosService: CatalogosService
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      nombreCompleto: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(150)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      rolId: [null, Validators.required],
      juzgadoId: [null, Validators.required],
      activo: [true],
      bloqueado: [false]
    });
  }

  ngOnInit(): void {
    // Si es edición, cargar el usuario existente
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      if (params['id']) {
        this.isCreation = false;
        this.usuarioId = +params['id'];
        this.cargarUsuario();
      }
    });
    
    // Deshabilitar username si es edición (también para tests sin ruta real)
    if (!this.isCreation) {
      this.form.get('username')?.disable();
    }
    
    // Cargar juzgados desde la API
    this.catalogosService.getJuzgados()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.juzgados = (res.data ?? []).map((j: any) => ({ label: j.nombre, value: j.id }));
          this.cdr.markForCheck();
        },
        error: () => {
          this.juzgados = [{ label: 'Juzgado Primero Civil', value: 1 }];
          this.cdr.markForCheck();
        }
      });

    // Roles: el backend expone /catalogos/roles si existe, sino fallback estático
    // (cat_rol no tiene endpoint público aún — usamos valores conocidos del seed)
    this.roles = [
      { label: 'ADMINISTRADOR', value: 1 },
      { label: 'SECRETARIO',    value: 2 },
      { label: 'AUXILIAR',      value: 3 },
      { label: 'CONSULTA',      value: 4 }
    ];
  }

  cargarUsuario(): void {
    if (!this.usuarioId) return;

    this.adminUsuariosService
      .getUsuario(this.usuarioId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          if (response.data) {
            const usuario = response.data;
            this.form.patchValue({
              nombreCompleto: usuario.nombreCompleto,
              email: usuario.email,
              rolId: usuario.rol,
              juzgadoId: usuario.juzgado,
              activo: usuario.activo,
              bloqueado: usuario.bloqueado
            });
          }
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Error al cargar usuario'
          });
          this.cdr.markForCheck();
        }
      });
  }

  guardar(): void {
    if (!this.form.valid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Por favor completa todos los campos requeridos'
      });
      return;
    }

    this.loading = true;

    if (this.isCreation) {
      const request: CrearUsuarioRequest = {
        username: this.form.get('username')?.value,
        nombreCompleto: this.form.get('nombreCompleto')?.value,
        email: this.form.get('email')?.value,
        rolId: this.form.get('rolId')?.value,
        juzgadoId: this.form.get('juzgadoId')?.value
      };

      this.adminUsuariosService
        .createUsuario(request)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response: any) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Usuario creado correctamente'
            });
            setTimeout(() => this.router.navigate(['/admin/usuarios']), 1000);
          },
          error: (err: any) => {
            this.loading = false;
            const errorMessage = err.error?.errors?.[0] || err.error?.message || 'Error al crear usuario';
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: errorMessage
            });
            this.cdr.markForCheck();
          }
        });
    } else if (this.usuarioId) {
      const request: ActualizarUsuarioRequest = {
        nombreCompleto: this.form.get('nombreCompleto')?.value,
        email: this.form.get('email')?.value,
        rolId: this.form.get('rolId')?.value,
        juzgadoId: this.form.get('juzgadoId')?.value,
        activo: this.form.get('activo')?.value,
        bloqueado: this.form.get('bloqueado')?.value
      };

      this.adminUsuariosService
        .updateUsuario(this.usuarioId, request)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response: any) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Usuario actualizado correctamente'
            });
            setTimeout(() => this.router.navigate(['/admin/usuarios']), 1000);
          },
          error: (err: any) => {
            this.loading = false;
            const errorMessage = err.error?.errors?.[0] || err.error?.message || 'Error al actualizar usuario';
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: errorMessage
            });
            this.cdr.markForCheck();
          }
        });
    }
  }

  cancelar(): void {
    this.router.navigate(['/admin/usuarios']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
