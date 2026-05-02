import { Component, OnInit, OnDestroy, ChangeDetectorRef , ChangeDetectionStrategy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { ExpedientesService } from '../../core/services/expedientes.service';
import { AuthService } from '../../core/services/auth.service';
import { AuditoriaService } from '../../core/services/auditoria.service';
import { AdminUsuariosService } from '../../core/services/admin-usuarios.service';
import { AuditoriaResponse } from '../../core/models/auditoria.model';
import { ExpedienteResponse } from '../../core/models/expediente.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="fade-in">
      <header class="dashboard-header">
        <h1 class="page-title">Dashboard</h1>
        <p class="subtitle">Bienvenido, {{ userName }}. Resumen del sistema al {{ today | date:'d MMMM, yyyy' }}.</p>
      </header>

      <!-- KPI Grid -->
      <section class="grid-4 mb-8" style="margin-top: var(--space-6);">
        <!-- Total Expedientes -->
        <div class="kpi-card" [class.kpi-loading]="loading">
          <div class="kpi-icon-box blue"><i class="pi pi-folder"></i></div>
          <div>
            <div class="kpi-value">
              <span *ngIf="!loading">{{ stats.total | number }}</span>
              <span *ngIf="loading" class="skeleton-text">—</span>
            </div>
            <div class="kpi-label">Expedientes Registrados</div>
          </div>
        </div>

        <!-- Expedientes Activos -->
        <div class="kpi-card" [class.kpi-loading]="loading">
          <div class="kpi-icon-box green"><i class="pi pi-check-circle"></i></div>
          <div>
            <div class="kpi-value">
              <span *ngIf="!loading">{{ stats.activos | number }}</span>
              <span *ngIf="loading" class="skeleton-text">—</span>
            </div>
            <div class="kpi-label">Expedientes Activos</div>
          </div>
        </div>

        <!-- Usuarios Activos -->
        <div class="kpi-card" [class.kpi-loading]="loading">
          <div class="kpi-icon-box cyan"><i class="pi pi-users"></i></div>
          <div>
            <div class="kpi-value">
              <span *ngIf="!loading">{{ stats.usuarios | number }}</span>
              <span *ngIf="loading" class="skeleton-text">—</span>
            </div>
            <div class="kpi-label">Usuarios Activos</div>
          </div>
        </div>

        <!-- Expedientes esta semana -->
        <div class="kpi-card" [class.kpi-loading]="loading">
          <div class="kpi-icon-box violet"><i class="pi pi-calendar-plus"></i></div>
          <div>
            <div class="kpi-value">
              <span *ngIf="!loading">{{ stats.recientes | number }}</span>
              <span *ngIf="loading" class="skeleton-text">—</span>
            </div>
            <div class="kpi-label">Recientes (últimos 5)</div>
          </div>
        </div>
      </section>

      <!-- Expedientes Recientes Table -->
      <section class="card glass-panel" style="margin-top: var(--space-6);">
        <div class="card-header">
          <h3 class="section-title"><i class="pi pi-folder-open"></i> EXPEDIENTES RECIENTES</h3>
          <a routerLink="/expedientes" class="btn btn-text btn-sm">Ver todo <i class="pi pi-arrow-right"></i></a>
        </div>
        <div style="overflow-x: auto;">
          <!-- Loading skeleton -->
          <div *ngIf="loading" class="loading-rows">
            <div class="skeleton-row" *ngFor="let i of [1,2,3,4,5]"></div>
          </div>

          <!-- Empty state -->
          <div *ngIf="!loading && expedientesRecientes.length === 0" class="empty-state">
            <i class="pi pi-inbox" style="font-size:2.5rem; color:var(--text-muted); opacity: 0.5;"></i>
            <p style="color:var(--text-muted); margin-top:var(--space-3); font-weight: 500;">No hay expedientes vinculados a su cuenta.</p>
          </div>

          <!-- Data table -->
          <table class="data-table" *ngIf="!loading && expedientesRecientes.length > 0">
            <thead>
              <tr>
                <th style="width: 200px">No. EXPEDIENTE</th>
                <th style="min-width: 300px">DESCRIPCIÓN</th>
                <th>USUARIO CREACIÓN</th>
                <th style="width: 180px">FECHA REGISTRO</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let exp of expedientesRecientes" class="hover:bg-primary-light/5">
                <td>
                  <a [routerLink]="['/expedientes', exp.id]"
                     style="font-weight:700; color:var(--primary-hover); text-decoration:none;"
                     class="flex items-center gap-2">
                    <i class="pi pi-folder-open text-xs"></i>
                    {{ exp.numero }}
                  </a>
                </td>
                <td style="max-width:350px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"
                    [title]="exp.descripcion">
                  <span class="text-white">{{ exp.descripcion || 'Sin descripción' }}</span>
                </td>
                <td>
                  <div class="flex items-center gap-3">
                    <div class="user-avatar" style="width:28px;height:28px;font-size:0.6rem; background: var(--border-strong);">
                      {{ getInitials(exp.usuarioCreacion) }}
                    </div>
                    <span class="text-xs text-slate-300">{{ exp.usuarioCreacion }}</span>
                  </div>
                </td>
                <td style="color:var(--text-secondary); white-space:nowrap; font-size: 0.8rem;">
                  {{ exp.fechaCreacion | date:'dd MMM yyyy, HH:mm' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Actividad Reciente (Auditoría) -->
      <section class="card glass-panel" style="margin-top: var(--space-6);" *ngIf="actividadReciente.length > 0 || loadingAuditoria">
        <div class="card-header">
          <h3 class="section-title"><i class="pi pi-history"></i> ACTIVIDAD RECIENTE</h3>
          <a routerLink="/admin/auditoria" class="btn btn-text btn-sm">Ver todo <i class="pi pi-arrow-right"></i></a>
        </div>
        <div style="overflow-x: auto;">
          <div *ngIf="loadingAuditoria" class="loading-rows">
            <div class="skeleton-row" *ngFor="let i of [1,2,3]"></div>
          </div>
          <table class="data-table" *ngIf="!loadingAuditoria && actividadReciente.length > 0">
            <thead>
              <tr>
                <th>USUARIO</th>
                <th>ACCIÓN</th>
                <th>MÓDULO</th>
                <th>FECHA / HORA</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let log of actividadReciente">
                <td>
                  <div class="flex items-center gap-3">
                    <div class="user-avatar" style="width:28px;height:28px;font-size:0.6rem;">
                      {{ getInitials(log.usuario) }}
                    </div>
                    <span style="font-weight:600;">{{ log.usuario }}</span>
                  </div>
                </td>
                <td><span class="badge badge-info">{{ log.accion }}</span></td>
                <td style="color:var(--text-secondary);">{{ log.modulo }}</td>
                <td style="color:var(--text-secondary); white-space:nowrap;">
                  {{ log.fecha | date:'dd/MM/yyyy HH:mm' }}
                </td>
                <td style="font-family:monospace; color:var(--text-muted); font-size:var(--font-xs);">
                  {{ log.ip }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-header { margin-bottom: 0; }

    .kpi-loading {
      opacity: 0.6;
      animation: pulse 1.5s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 0.6; }
      50%       { opacity: 0.3; }
    }

    .skeleton-text {
      display: inline-block;
      width: 60px;
      height: 1.5rem;
      background: var(--border-color, #334155);
      border-radius: 4px;
      animation: pulse 1.5s ease-in-out infinite;
    }

    .loading-rows { padding: var(--space-4); }
    .skeleton-row {
      height: 40px;
      background: var(--border-color, #334155);
      border-radius: 6px;
      margin-bottom: var(--space-2);
      animation: pulse 1.5s ease-in-out infinite;
    }

    .empty-state {
      text-align: center;
      padding: var(--space-8) var(--space-4);
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats = {
    total:    0,
    activos:  0,
    usuarios: 0,
    recientes: 0,
  };

  userName             = '';
  today                = new Date();
  loading              = true;
  loadingAuditoria     = true;
  expedientesRecientes: ExpedienteResponse[] = [];
  actividadReciente:   AuditoriaResponse[]   = [];

  private destroy$ = new Subject<void>();

  constructor(
    private expedientesService: ExpedientesService,
    private authService: AuthService,
    private auditoriaService: AuditoriaService,
    private adminUsuariosService: AdminUsuariosService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    // Nombre del usuario logueado
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.nombreCompleto?.split(' ')[0] || user.username;
    }

    this.cargarExpedientes();
    this.cargarUsuarios();
    this.cargarAuditoria();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarExpedientes(): void {
    // Carga página 0 grande para contar activos y tener los 5 recientes
    forkJoin({
      recientes: this.expedientesService
        .getExpedientes({ page: 0, size: 5, sort: 'fechaCreacion,desc' })
        .pipe(catchError(() => of(null))),
      total: this.expedientesService
        .getExpedientes({ page: 0, size: 1 })
        .pipe(catchError(() => of(null))),
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe(({ recientes, total }) => {
      // Expedientes recientes para la tabla
      this.expedientesRecientes = recientes?.data?.content ?? [];
      this.stats.recientes      = this.expedientesRecientes.length;

      // Total real de la BD
      this.stats.total  = total?.data?.totalElements ?? (recientes?.data?.totalElements ?? 0);
      // Contar activos (estadoId=1 en los recientes como aproximación si no hay endpoint dedicado)
      this.stats.activos = this.expedientesRecientes.filter(
        (e: any) => String(e.estadoId) === '1' || String(e.estadoNombre)?.toLowerCase() === 'activo'
      ).length;

      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  private cargarUsuarios(): void {
    this.adminUsuariosService
      .getUsuarios({ activo: true, page: 0, size: 1 })
      .pipe(takeUntil(this.destroy$), catchError(() => of(null)))
      .subscribe(res => {
        this.stats.usuarios = res?.data?.totalElements ?? 0;
        this.cdr.detectChanges();
      });
  }

  private cargarAuditoria(): void {
    this.auditoriaService
      .getAuditoria({ page: 0, size: 5, sort: 'fecha,desc' })
      .pipe(takeUntil(this.destroy$), catchError(() => of(null)))
      .subscribe(res => {
        this.actividadReciente = res?.data?.content ?? [];
        this.loadingAuditoria  = false;
        this.cdr.detectChanges();
      });
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(/[\s._-]+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  }
}
