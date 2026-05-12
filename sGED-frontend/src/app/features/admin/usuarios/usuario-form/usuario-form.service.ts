import { Injectable, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AdminUsuariosService } from '../../../../core/services/admin-usuarios.service';
import { CatalogosService } from '../../../../core/services/catalogos.service';
import { UsuarioFormDto } from './usuario-form.dto';
import { LoadState, CrearUsuarioRequest, ActualizarUsuarioRequest } from './usuario-form.types';

@Injectable()
export class UsuarioFormService {
  private readonly destroyRef   = inject(DestroyRef);
  private readonly route        = inject(ActivatedRoute);
  private readonly router       = inject(Router);
  private readonly adminSvc     = inject(AdminUsuariosService);
  private readonly msgSvc       = inject(MessageService);
  private readonly catalogosSvc = inject(CatalogosService);
  private readonly fb           = inject(FormBuilder);

  readonly dto = new UsuarioFormDto();

  readonly form: FormGroup = this.fb.group({
    username:      ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    nombreCompleto:['', [Validators.required, Validators.minLength(5), Validators.maxLength(150)]],
    email:         ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    rolId:         [null, Validators.required],
    juzgadoId:     [null, Validators.required],
    activo:        [true],
    bloqueado:     [false]
  });

  constructor() {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      if (params['id']) {
        this.dto.isCreation.set(false);
        this.dto.usuarioId.set(+params['id']);
        this.form.get('username')?.disable();
        this.cargarUsuario();
      }
    });

    this.catalogosSvc.getJuzgados()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.dto.juzgados.set((res.data ?? []).map((j: any) => ({ label: j.nombre, value: j.id })));
        },
        error: () => {
          this.dto.juzgados.set([{ label: 'Juzgado Primero Civil', value: 1 }]);
        }
      });
  }

  cargarUsuario(): void {
    const id = this.dto.usuarioId();
    if (!id) return;
    this.dto.state.set(LoadState.Loading);

    this.adminSvc.getUsuario(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          if (response.data) {
            const u = response.data;
            this.form.patchValue({
              nombreCompleto: u.nombreCompleto,
              email:          u.email,
              rolId:          u.rol,
              juzgadoId:      u.juzgado,
              activo:         u.activo,
              bloqueado:      u.bloqueado
            });
          }
          this.dto.state.set(LoadState.Idle);
        },
        error: (err: any) => {
          this.dto.state.set(LoadState.Error);
          this.msgSvc.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al cargar usuario' });
        }
      });
  }

  guardar(): void {
    if (!this.form.valid) {
      this.msgSvc.add({ severity: 'warn', summary: 'Validación', detail: 'Por favor completa todos los campos requeridos' });
      return;
    }
    this.dto.submitting.set(true);

    if (this.dto.isCreation()) {
      const request: CrearUsuarioRequest = {
        username:      this.form.get('username')?.value,
        nombreCompleto:this.form.get('nombreCompleto')?.value,
        email:         this.form.get('email')?.value,
        rolId:         this.form.get('rolId')?.value,
        juzgadoId:     this.form.get('juzgadoId')?.value
      };

      this.adminSvc.createUsuario(request)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.msgSvc.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario creado correctamente' });
            this.router.navigate(['/admin/usuarios']);
          },
          error: (err: any) => {
            this.dto.submitting.set(false);
            this.msgSvc.add({ severity: 'error', summary: 'Error', detail: err.error?.errors?.[0] || err.error?.message || 'Error al crear usuario' });
          }
        });
    } else {
      const id = this.dto.usuarioId();
      if (!id) return;

      const request: ActualizarUsuarioRequest = {
        nombreCompleto: this.form.get('nombreCompleto')?.value,
        email:          this.form.get('email')?.value,
        rolId:          this.form.get('rolId')?.value,
        juzgadoId:      this.form.get('juzgadoId')?.value,
        activo:         this.form.get('activo')?.value,
        bloqueado:      this.form.get('bloqueado')?.value
      };

      this.adminSvc.updateUsuario(id, request)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.msgSvc.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado correctamente' });
            this.router.navigate(['/admin/usuarios']);
          },
          error: (err: any) => {
            this.dto.submitting.set(false);
            this.msgSvc.add({ severity: 'error', summary: 'Error', detail: err.error?.errors?.[0] || err.error?.message || 'Error al actualizar usuario' });
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
