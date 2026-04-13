import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExpedientesService } from '../../core/services/expedientes.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
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
        <div class="kpi-card">
          <div class="kpi-icon-box blue"><i class="pi pi-folder"></i></div>
          <div>
            <div class="kpi-value">{{ stats.total | number }}</div>
            <div class="kpi-label">Expedientes Registrados</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-box green"><i class="pi pi-file"></i></div>
          <div>
            <div class="kpi-value">{{ stats.documentos | number }}</div>
            <div class="kpi-label">Documentos Almacenados</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-box violet"><i class="pi pi-search"></i></div>
          <div>
            <div class="kpi-value">{{ stats.busquedas }}</div>
            <div class="kpi-label">Búsquedas Hoy</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-box cyan"><i class="pi pi-users"></i></div>
          <div>
            <div class="kpi-value">{{ stats.usuarios }}</div>
            <div class="kpi-label">Usuarios Activos</div>
          </div>
        </div>
      </section>

      <!-- Activity Table -->
      <section class="card glass-panel" style="margin-top: var(--space-6);">
        <div class="card-header">
          <h3 class="section-title"><i class="pi pi-history"></i> ACTIVIDAD RECIENTE</h3>
          <a routerLink="/expedientes" class="btn btn-text btn-sm">Ver todo <i class="pi pi-arrow-right"></i></a>
        </div>
        <div style="overflow-x: auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>USUARIO</th>
                <th>ACCIÓN</th>
                <th>EXPEDIENTE</th>
                <th>FECHA / HORA</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div class="flex items-center gap-3">
                    <div class="user-avatar" style="width:32px;height:32px;font-size:0.7rem;">EG</div>
                    <span style="font-weight:600;">Emilio González</span>
                  </div>
                </td>
                <td><span class="badge badge-info">Consulta</span></td>
                <td style="font-weight:600;color:var(--primary-hover);">NAZ-2024-00847</td>
                <td style="color:var(--text-secondary);">{{ today | date:'dd/MM/yyyy HH:mm' }}</td>
                <td style="font-family:monospace;color:var(--text-muted);font-size:var(--font-xs);">192.168.1.45</td>
              </tr>
              <tr>
                <td>
                  <div class="flex items-center gap-3">
                    <div class="user-avatar" style="width:32px;height:32px;font-size:0.7rem;">AG</div>
                    <span style="font-weight:600;">Allan Gil</span>
                  </div>
                </td>
                <td><span class="badge badge-active">Carga Doc</span></td>
                <td style="font-weight:600;color:var(--primary-hover);">NAZ-2024-01203</td>
                <td style="color:var(--text-secondary);">{{ today | date:'dd/MM/yyyy HH:mm' }}</td>
                <td style="font-family:monospace;color:var(--text-muted);font-size:var(--font-xs);">192.168.1.22</td>
              </tr>
              <tr>
                <td>
                  <div class="flex items-center gap-3">
                    <div class="user-avatar" style="width:32px;height:32px;font-size:0.7rem;background:linear-gradient(135deg,var(--accent-rose),var(--accent-amber));">MR</div>
                    <span style="font-weight:600;">María Rodríguez</span>
                  </div>
                </td>
                <td><span class="badge badge-pending">Descarga</span></td>
                <td style="font-weight:600;color:var(--primary-hover);">ACP-2023-00412</td>
                <td style="color:var(--text-secondary);">{{ today | date:'dd/MM/yyyy HH:mm' }}</td>
                <td style="font-family:monospace;color:var(--text-muted);font-size:var(--font-xs);">192.168.1.67</td>
              </tr>
              <tr *ngFor="let item of recientes; let i = index">
                <td>
                  <div class="flex items-center gap-3">
                    <div class="user-avatar" style="width:32px;height:32px;font-size:0.7rem;">QA</div>
                    <span style="font-weight:600;">Admin QA</span>
                  </div>
                </td>
                <td><span class="badge badge-info">Consulta</span></td>
                <td>
                  <a [routerLink]="['/expedientes', item.id]" style="font-weight:600;color:var(--primary-hover);">{{ item.numero }}</a>
                </td>
                <td style="color:var(--text-secondary);">{{ item.fechaCreacion | date:'dd/MM/yyyy HH:mm' }}</td>
                <td style="font-family:monospace;color:var(--text-muted);font-size:var(--font-xs);">10.0.0.1</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-header { margin-bottom: 0; }
  `]
})
export class DashboardComponent implements OnInit {
  stats = {
    total: 1247,
    documentos: 5832,
    busquedas: 342,
    usuarios: 18
  };

  userName = 'Amilcar';
  today = new Date();
  recientes: any[] = [];

  constructor(
    private expedientesService: ExpedientesService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.nombreCompleto?.split(' ')[0] || user.username;
    }
    this.expedientesService.getExpedientes({ page: 0, size: 5, sort: 'fechaCreacion,desc' }).subscribe((res: any) => {
      this.recientes = res.data?.content || [];
    });
  }
}
