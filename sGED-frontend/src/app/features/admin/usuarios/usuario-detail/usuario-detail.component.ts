import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminUsuariosService } from '../../../../core/services/admin-usuarios.service';
import { UsuarioAdminResponse } from '../../../../core/models/admin-usuarios.model';
import { ApiResponse } from '../../../../core/models/api-response.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-usuario-detail',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, ToastModule],
  providers: [MessageService],
  template: `
    @if (usuario) {
    <div class="fade-in">
      <!-- Page Header -->
      <div class="page-header-actions mb-6">
        <div>
          <h1 class="page-title">Perfil de Usuario</h1>
          <p class="subtitle">Información detallada de la cuenta</p>
        </div>
        <div class="flex gap-3">
          <button class="btn btn-primary" (click)="editar()">
            <i class="pi pi-pencil"></i> Editar
          </button>
          <button class="btn btn-secondary" (click)="volver()">
            <i class="pi pi-arrow-left"></i> Volver
          </button>
        </div>
      </div>

      <!-- Profile Header Card -->
      <div class="card glass-panel shadow-lg mb-6 p-6 relative overflow-hidden">
        <div class="absolute top-0 left-0 right-0 h-[3px]" style="background: linear-gradient(90deg, var(--primary), var(--accent-cyan), var(--accent-violet)); box-shadow: 0 0 10px var(--primary-glow);"></div>
        <div class="flex items-center gap-6">
          <div class="user-avatar" style="width:72px; height:72px; font-size:1.5rem;">
            {{ getInitials(usuario.nombreCompleto) }}
          </div>
          <div class="flex flex-col gap-1">
            <span style="font-size: var(--font-2xl); font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em;">{{ usuario.nombreCompleto }}</span>
            <span style="font-size: var(--font-sm); color: var(--text-secondary);">{{ usuario.email }}</span>
            <div class="flex items-center gap-3 mt-2">
              <span class="badge badge-info">
                <i class="pi pi-shield" style="font-size:0.7rem;"></i>
                {{ usuario.rol }}
              </span>
              <span class="badge" [ngClass]="usuario.activo ? 'badge-active' : 'badge-urgent'">
                {{ usuario.activo ? 'Activo' : 'Inactivo' }}
              </span>
              @if (usuario.bloqueado) {
              <span class="badge badge-urgent">
                <i class="pi pi-lock" style="font-size:0.7rem;"></i>
                Bloqueado
              </span>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Info Grid -->
      <div class="grid-2 mb-6">
        <!-- Account Info -->
        <div class="card glass-panel p-5">
          <div class="section-title mb-4">
            <i class="pi pi-user"></i> INFORMACIÓN DE CUENTA
          </div>
          <div class="meta-list">
            <div class="detail-row">
              <span class="detail-label"><i class="pi pi-at"></i> Username</span>
              <span class="detail-value">{{ usuario.username }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label"><i class="pi pi-envelope"></i> Email</span>
              <span class="detail-value">{{ usuario.email }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label"><i class="pi pi-building"></i> Juzgado</span>
              <span class="detail-value">{{ usuario.juzgado }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label"><i class="pi pi-shield"></i> Rol</span>
              <span class="detail-value" style="color: var(--accent-cyan); font-weight: 700;">{{ usuario.rol }}</span>
            </div>
          </div>
        </div>

        <!-- Security Info -->
        <div class="card glass-panel p-5">
          <div class="section-title mb-4">
            <i class="pi pi-lock"></i> SEGURIDAD
          </div>
          <div class="meta-list">
            <div class="detail-row">
              <span class="detail-label"><i class="pi pi-check-circle"></i> Estado</span>
              <span class="detail-value">
                <span class="badge" [ngClass]="usuario.activo ? 'badge-active' : 'badge-urgent'" style="font-size: 0.7rem;">
                  {{ usuario.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label"><i class="pi pi-lock"></i> Bloqueo</span>
              <span class="detail-value">
                <span class="badge" [ngClass]="usuario.bloqueado ? 'badge-urgent' : 'badge-active'" style="font-size: 0.7rem;">
                  {{ usuario.bloqueado ? 'Bloqueado' : 'Desbloqueado' }}
                </span>
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label"><i class="pi pi-key"></i> Debe Cambiar Contraseña</span>
              <span class="detail-value">{{ usuario.debeCambiarPassword ? 'Sí' : 'No' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label"><i class="pi pi-exclamation-triangle"></i> Intentos Fallidos</span>
              <span class="detail-value" [style.color]="usuario.intentosFallidos > 0 ? 'var(--accent-rose)' : 'var(--text-primary)'">
                {{ usuario.intentosFallidos }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Timestamps -->
      <div class="card glass-panel p-5">
        <div class="section-title mb-4">
          <i class="pi pi-clock"></i> REGISTRO TEMPORAL
        </div>
        <div class="flex gap-8">
          <div class="detail-row" style="flex:1;">
            <span class="detail-label"><i class="pi pi-calendar-plus"></i> Fecha de Creación</span>
            <span class="detail-value">{{ usuario.fechaCreacion | date:'dd MMMM yyyy, HH:mm' }}</span>
          </div>
          <div class="detail-row" style="flex:1;">
            <span class="detail-label"><i class="pi pi-calendar"></i> Última Modificación</span>
            <span class="detail-value">{{ usuario.fechaModificacion | date:'dd MMMM yyyy, HH:mm' }}</span>
          </div>
        </div>
      </div>
    </div>
    }

    <p-toast></p-toast>
  `,
  styles: [`
    .page-header-actions {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .meta-list {
      display: flex;
      flex-direction: column;
      gap: 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.875rem 0;
      border-bottom: 1px solid var(--border);
    }
    .detail-row:last-child { border-bottom: none; }
    .detail-label {
      font-size: var(--font-xs);
      font-weight: 600;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .detail-label i {
      color: var(--primary);
      font-size: 0.8rem;
    }
    .detail-value {
      font-size: var(--font-sm);
      font-weight: 600;
      color: var(--text-primary);
    }
  `]
})
export class UsuarioDetailComponent implements OnInit, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);

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
        next: (response: ApiResponse<UsuarioAdminResponse>) => {
          if (response.data) {
            this.usuario = response.data;
          }
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message || 'Error al cargar usuario'
          });
          this.cdr.markForCheck();
        }
      });
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(/[\s._-]+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
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

