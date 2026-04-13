import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminUsuariosService } from '../../../../core/services/admin-usuarios.service';
import {
  ActualizarUsuarioRequest,
  CrearUsuarioRequest,
  UsuarioAdminResponse
} from '../../../../core/models/admin-usuarios.model';
import { CatalogosService } from '../../../../core/services/catalogos.service';

@Component({
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
    <div class="card max-w-2xl mx-auto">
      <h3 class="mb-4">{{ isCreation ? 'Crear Nuevo Usuario' : 'Editar Usuario' }}</h3>

      <form [formGroup]="form" (ngSubmit)="guardar()">
        <!-- Username (solo en creación) -->
        <div class="field" *ngIf="isCreation">
          <label htmlFor="username">Username *</label>
          <input
            pInputText
            id="username"
            type="text"
            formControlName="username"
            class="w-full"
            [class.ng-invalid.ng-touched]="isFieldInvalid('username')"
          />
          <div class="text-red-500 text-sm mt-1" *ngIf="isFieldInvalid('username')">
            <div *ngIf="form.get('username')?.errors?.['required']">El username es requerido</div>
            <div *ngIf="form.get('username')?.errors?.['minlength']">Mínimo 3 caracteres</div>
            <div *ngIf="form.get('username')?.errors?.['maxlength']">Máximo 50 caracteres</div>
          </div>
        </div>

        <!-- Nombre Completo -->
        <div class="field">
          <label htmlFor="nombreCompleto">Nombre Completo *</label>
          <input
            pInputText
            id="nombreCompleto"
            type="text"
            formControlName="nombreCompleto"
            class="w-full"
            [class.ng-invalid.ng-touched]="isFieldInvalid('nombreCompleto')"
          />
          <div class="text-red-500 text-sm mt-1" *ngIf="isFieldInvalid('nombreCompleto')">
            <div *ngIf="form.get('nombreCompleto')?.errors?.['required']">El nombre completo es requerido</div>
            <div *ngIf="form.get('nombreCompleto')?.errors?.['minlength']">Mínimo 5 caracteres</div>
            <div *ngIf="form.get('nombreCompleto')?.errors?.['maxlength']">Máximo 150 caracteres</div>
          </div>
        </div>

        <!-- Email -->
        <div class="field">
          <label htmlFor="email">Email *</label>
          <input
            pInputText
            id="email"
            type="email"
            formControlName="email"
            class="w-full"
            [class.ng-invalid.ng-touched]="isFieldInvalid('email')"
          />
          <div class="text-red-500 text-sm mt-1" *ngIf="isFieldInvalid('email')">
            <div *ngIf="form.get('email')?.errors?.['required']">El email es requerido</div>
            <div *ngIf="form.get('email')?.errors?.['email']">Email inválido</div>
            <div *ngIf="form.get('email')?.errors?.['maxlength']">Máximo 100 caracteres</div>
          </div>
        </div>

        <!-- Rol -->
        <div class="field">
          <label htmlFor="rolId">Rol *</label>
          <select
            id="rolId"
            formControlName="rolId"
            pInputText
            class="w-full"
          >
            <option value="">Seleccionar rol</option>
            <option *ngFor="let rol of roles" [value]="rol.value">{{ rol.label }}</option>
          </select>
          <div class="text-red-500 text-sm mt-1" *ngIf="isFieldInvalid('rolId')">
            <div *ngIf="form.get('rolId')?.errors?.['required']">El rol es requerido</div>
          </div>
        </div>

        <!-- Juzgado -->
        <div class="field">
          <label htmlFor="juzgadoId">Juzgado *</label>
          <select
            id="juzgadoId"
            formControlName="juzgadoId"
            pInputText
            class="w-full"
          >
            <option value="">Seleccionar juzgado</option>
            <option *ngFor="let juzgado of juzgados" [value]="juzgado.value">{{ juzgado.label }}</option>
          </select>
          <div class="text-red-500 text-sm mt-1" *ngIf="isFieldInvalid('juzgadoId')">
            <div *ngIf="form.get('juzgadoId')?.errors?.['required']">El juzgado es requerido</div>
          </div>
        </div>

        <!-- Activo (solo en edición) -->
        <div class="field" *ngIf="!isCreation">
          <label htmlFor="activo">Activo</label>
          <select
            id="activo"
            formControlName="activo"
            pInputText
            class="w-full"
          >
            <option [value]="true">Activo</option>
            <option [value]="false">Inactivo</option>
          </select>
        </div>

        <!-- Bloqueado (solo en edición) -->
        <div class="field" *ngIf="!isCreation">
          <label htmlFor="bloqueado">Bloqueado</label>
          <select
            id="bloqueado"
            formControlName="bloqueado"
            pInputText
            class="w-full"
          >
            <option [value]="false">Desbloqueado</option>
            <option [value]="true">Bloqueado</option>
          </select>
        </div>

        <!-- Botones -->
        <div class="flex gap-3 mt-6">
          <p-button
            type="submit"
            label="{{ isCreation ? 'Crear' : 'Guardar' }}"
            icon="pi pi-check"
            [loading]="loading"
            [disabled]="!form.valid || loading"
          ></p-button>
          <p-button
            type="button"
            label="Cancelar"
            icon="pi pi-times"
            severity="secondary"
            (onClick)="cancelar()"
          ></p-button>
        </div>
      </form>
    </div>

    <p-toast></p-toast>
  `,
  styles: []
})
export class UsuarioFormComponent implements OnInit, OnDestroy {
  form: FormGroup;
  loading = false;
  isCreation = true;
  usuarioId: number | null = null;
  roles: { label: string; value: number }[] = [];
  juzgados: { label: string; value: number }[] = [];

  private destroy$ = new Subject<void>();

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
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
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
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.juzgados = (res.data ?? []).map((j: any) => ({ label: j.nombre, value: j.id }));
        },
        error: () => {
          // Fallback mínimo si la API falla
          this.juzgados = [{ label: 'Juzgado Primero Civil', value: 1 }];
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarUsuario(): void {
    if (!this.usuarioId) return;

    this.adminUsuariosService
      .getUsuario(this.usuarioId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.data) {
            const usuario = response.data;
            this.form.patchValue({
              nombreCompleto: usuario.nombreCompleto,
              email: usuario.email,
              rolId: usuario.rol, // Asumimos que el backend retorna el ID del rol
              juzgadoId: usuario.juzgado, // Asumimos que el backend retorna el ID del juzgado
              activo: usuario.activo,
              bloqueado: usuario.bloqueado
            });
          }
        },
        error: (err: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Error al cargar usuario'
          });
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
        .pipe(takeUntil(this.destroy$))
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
        .pipe(takeUntil(this.destroy$))
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
