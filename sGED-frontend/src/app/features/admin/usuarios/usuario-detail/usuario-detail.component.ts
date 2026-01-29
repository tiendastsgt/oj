import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminUsuariosService } from '../../../core/services/admin-usuarios.service';
import { UsuarioAdminResponse } from '../../../core/models/admin-usuarios.model';

@Component({
  selector: 'app-usuario-detail',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, ToastModule],
  providers: [MessageService],
  template: `
    <div class="card max-w-2xl mx-auto" *ngIf="usuario">
      <div class="flex justify-between items-center mb-4">
        <h3>Detalle del Usuario</h3>
        <div class="flex gap-2">
          <p-button
            label="Editar"
            icon="pi pi-pencil"
            (onClick)="editar()"
          ></p-button>
          <p-button
            label="Volver"
            icon="pi pi-arrow-left"
            severity="secondary"
            (onClick)="volver()"
          ></p-button>
        </div>
      </div>

      <div class="grid">
        <div class="col-12 md:col-6">
          <div class="field">
            <label>Username</label>
            <p>{{ usuario.username }}</p>
          </div>
        </div>
        <div class="col-12 md:col-6">
          <div class="field">
            <label>Nombre Completo</label>
            <p>{{ usuario.nombreCompleto }}</p>
          </div>
        </div>
        <div class="col-12 md:col-6">
          <div class="field">
            <label>Email</label>
            <p>{{ usuario.email }}</p>
          </div>
        </div>
        <div class="col-12 md:col-6">
          <div class="field">
            <label>Rol</label>
            <p>{{ usuario.rol }}</p>
          </div>
        </div>
        <div class="col-12 md:col-6">
          <div class="field">
            <label>Juzgado</label>
            <p>{{ usuario.juzgado }}</p>
          </div>
        </div>
        <div class="col-12 md:col-6">
          <div class="field">
            <label>Estado</label>
            <p [class]="usuario.activo ? 'text-green-500' : 'text-red-500'">
              {{ usuario.activo ? 'Activo' : 'Inactivo' }}
            </p>
          </div>
        </div>
        <div class="col-12 md:col-6">
          <div class="field">
            <label>Bloqueo</label>
            <p [class]="usuario.bloqueado ? 'text-red-500' : 'text-green-500'">
              {{ usuario.bloqueado ? 'Bloqueado' : 'Desbloqueado' }}
            </p>
          </div>
        </div>
        <div class="col-12 md:col-6">
          <div class="field">
            <label>Debe Cambiar Contraseña</label>
            <p>{{ usuario.debeCambiarPassword ? 'Sí' : 'No' }}</p>
          </div>
        </div>
        <div class="col-12 md:col-6">
          <div class="field">
            <label>Intentos Fallidos</label>
            <p>{{ usuario.intentosFallidos }}</p>
          </div>
        </div>
        <div class="col-12 md:col-6">
          <div class="field">
            <label>Fecha de Creación</label>
            <p>{{ usuario.fechaCreacion | date : 'short' }}</p>
          </div>
        </div>
        <div class="col-12 md:col-6">
          <div class="field">
            <label>Última Modificación</label>
            <p>{{ usuario.fechaModificacion | date : 'short' }}</p>
          </div>
        </div>
      </div>
    </div>

    <p-toast></p-toast>
  `,
  styles: []
})
export class UsuarioDetailComponent implements OnInit, OnDestroy {
  usuario: UsuarioAdminResponse | null = null;
  usuarioId: number | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminUsuariosService: AdminUsuariosService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['id']) {
        this.usuarioId = +params['id'];
        this.cargarUsuario();
      }
    });
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
        next: (response) => {
          if (response.data) {
            this.usuario = response.data;
          }
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Error al cargar usuario'
          });
        }
      });
  }

  editar(): void {
    if (this.usuarioId) {
      this.router.navigate(['/admin/usuarios', this.usuarioId, 'editar']);
    }
  }

  volver(): void {
    this.router.navigate(['/admin/usuarios']);
  }
}
