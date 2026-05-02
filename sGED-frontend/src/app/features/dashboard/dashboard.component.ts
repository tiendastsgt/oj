import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { catchError, startWith, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import { ExpedientesService, ExpedienteEstadisticas } from '../../core/services/expedientes.service';
import { AuthService } from '../../core/services/auth.service';
import { AuditoriaService } from '../../core/services/auditoria.service';
import { AuditoriaResponse } from '../../core/models/auditoria.model';
import { ExpedienteResponse } from '../../core/models/expediente.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
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
              @if (!loading) { <span>{{ stats.totalExpedientes | number }}</span> }
              @if (loading)   { <span class="skeleton-text">—</span> }
            </div>
            <div class="kpi-label">Expedientes Registrados</div>
          </div>
        </div>

        <!-- En Proceso -->
        <div class="kpi-card" [class.kpi-loading]="loading">
          <div class="kpi-icon-box green"><i class="pi pi-check-circle"></i></div>
          <div>
            <div class="kpi-value">
              @if (!loading) { <span>{{ stats.enProceso | number }}</span> }
              @if (loading)   { <span class="skeleton-text">—</span> }
            </div>
            <div class="kpi-label">En Proceso (Activos)</div>
          </div>
        </div>

        <!-- Pendientes -->
        <div class="kpi-card" [class.kpi-loading]="loading">
          <div class="kpi-icon-box amber"><i class="pi pi-clock"></i></div>
          <div>
            <div class="kpi-value">
              @if (!loading) { <span>{{ stats.pendientes | number }}</span> }
              @if (loading)   { <span class="skeleton-text">—</span> }
            </div>
            <div class="kpi-label">Pendientes (En espera)</div>
          </div>
        </div>

        <!-- Archivados -->
        <div class="kpi-card" [class.kpi-loading]="loading">
          <div class="kpi-icon-box violet"><i class="pi pi-inbox"></i></div>
          <div>
            <div class="kpi-value">
              @if (!loading) { <span>{{ stats.archivados | number }}</span> }
              @if (loading)   { <span class="skeleton-text">—</span> }
            </div>
            <div class="kpi-label">Archivados</div>
          </div>
        </div>
      </section>

      <!-- Expedientes Recientes Table -->
      <section class="card glass-panel" style="margin-top: var(--space-6);">
        <div class="card-header">
          <h3 class="section-title"><i class="pi pi-folder-open"></i> EXPEDIENTES RECIENTES</h3>
          <a routerLink="/expedientes" class="btn btn-text btn-sm">Ver todo <i class="pi pi-arrow-right"></i></a>
        </div>

        <!-- Filtros (valueChanges dispara recarga vía switchMap) -->
        <div class="dashboard-filters" [formGroup]="filterForm">
          <select formControlName="estadoId" class="form-input form-select" aria-label="Filtrar por estado">
            <option [ngValue]="null">Todos los estados</option>
            <option [ngValue]="1">Activo</option>
            <option [ngValue]="2">En espera</option>
            <option [ngValue]="3">Suspendido</option>
            <option [ngValue]="4">Cerrado</option>
            <option [ngValue]="5">Archivado</option>
          </select>
          <input type="date" formControlName="fechaDesde" class="form-input" aria-label="Fecha desde" />
          <input type="date" formControlName="fechaHasta" class="form-input" aria-label="Fecha hasta" />
        </div>
        <div style="overflow-x: auto;">
          <!-- Loading skeleton -->
          @if (loading) {
          <div class="loading-rows">
            @for (i of [1,2,3,4,5]; track $index) {
            <div class="skeleton-row"></div>
            }
          </div>
          }

          <!-- Empty state -->
          @if (!loading && expedientesRecientes.length === 0) {
          <div class="empty-state">
            <i class="pi pi-inbox" style="font-size:2.5rem; color:var(--text-muted); opacity: 0.5;"></i>
            <p style="color:var(--text-muted); margin-top:var(--space-3); font-weight: 500;">No hay expedientes vinculados a su cuenta.</p>
          </div>
          }

          <!-- Data table -->
          @if (!loading && expedientesRecientes.length > 0) {
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 200px">No. EXPEDIENTE</th>
                <th style="min-width: 300px">DESCRIPCIÓN</th>
                <th>USUARIO CREACIÓN</th>
                <th style="width: 180px">FECHA REGISTRO</th>
              </tr>
            </thead>
            <tbody>
              @for (exp of expedientesRecientes; track exp.id) {
              <tr class="hover:bg-primary-light/5">
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
              }
            </tbody>
          </table>
          }
        </div>
      </section>

      <!-- Actividad Reciente (Auditoría) -->
      @if (actividadReciente.length > 0 || loadingAuditoria) {
      <section class="card glass-panel" style="margin-top: var(--space-6);">
        <div class="card-header">
          <h3 class="section-title"><i class="pi pi-history"></i> ACTIVIDAD RECIENTE</h3>
          <a routerLink="/admin/auditoria" class="btn btn-text btn-sm">Ver todo <i class="pi pi-arrow-right"></i></a>
        </div>
        <div style="overflow-x: auto;">
          @if (loadingAuditoria) {
          <div class="loading-rows">
            @for (i of [1,2,3]; track $index) {
            <div class="skeleton-row"></div>
            }
          </div>
          }
          @if (!loadingAuditoria && actividadReciente.length > 0) {
          <table class="data-table">
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
              @for (log of actividadReciente; track log.id) {
              <tr>
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
              }
            </tbody>
          </table>
          }
        </div>
      </section>
      }
    </div>
  `,
  styles: [`
    .dashboard-header { margin-bottom: 0; }

    .dashboard-filters {
      display: flex;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border-bottom: 1px solid var(--border);
      flex-wrap: wrap;
    }
    .dashboard-filters .form-input {
      flex: 1;
      min-width: 140px;
      max-width: 200px;
      padding: 0.45rem 0.75rem;
      font-size: var(--font-xs);
    }

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
export class DashboardComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb         = inject(FormBuilder);

  stats: ExpedienteEstadisticas = {
    totalExpedientes: 0,
    pendientes: 0,
    enProceso:  0,
    resueltos:  0,
    archivados: 0,
  };

  filterForm: FormGroup = this.fb.group({
    estadoId:   [null],
    juzgadoId:  [null],
    fechaDesde: [null],
    fechaHasta: [null],
  });

  userName             = '';
  today                = new Date();
  loading              = true;
  loadingAuditoria     = true;
  expedientesRecientes: ExpedienteResponse[] = [];
  actividadReciente:   AuditoriaResponse[]   = [];

  constructor(
    private expedientesService: ExpedientesService,
    private authService: AuthService,
    private auditoriaService: AuditoriaService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.nombreCompleto?.split(' ')[0] || user.username;
    }

    this.cargarEstadisticas();
    this.observarFiltros();
    this.cargarAuditoria();
  }

  private cargarEstadisticas(): void {
    this.expedientesService.getEstadisticas()
      .pipe(takeUntilDestroyed(this.destroyRef), catchError(() => of(null)))
      .subscribe(res => {
        if (res?.data) this.stats = res.data;
        this.cdr.markForCheck();
      });
  }

  // switchMap cancela peticiones obsoletas cuando el usuario cambia filtros
  // rápidamente, evitando race conditions sobre expedientesRecientes.
  private observarFiltros(): void {
    this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.value),
      tap(() => { this.loading = true; this.cdr.markForCheck(); }),
      switchMap(filtros => this.expedientesService.getExpedientes({
        page: 0, size: 5, sort: 'fechaCreacion,desc',
        estadoId:   filtros.estadoId   ?? undefined,
        juzgadoId:  filtros.juzgadoId  ?? undefined,
        fechaDesde: filtros.fechaDesde ?? undefined,
        fechaHasta: filtros.fechaHasta ?? undefined,
      }).pipe(catchError(() => of(null)))),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(res => {
      this.expedientesRecientes = res?.data?.content ?? [];
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  private cargarAuditoria(): void {
    this.auditoriaService
      .getAuditoria({ page: 0, size: 5, sort: 'fecha,desc' })
      .pipe(takeUntilDestroyed(this.destroyRef), catchError(() => of(null)))
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
