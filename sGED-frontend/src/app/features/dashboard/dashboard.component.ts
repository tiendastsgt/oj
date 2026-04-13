import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { KpiCardComponent } from '../../shared/components/kpi-card.component';
import { ExpedientesService } from '../../core/services/expedientes.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, KpiCardComponent, StatusBadgeComponent],
  template: `
    <div class="dashboard-wrapper fade-in">
      <header class="dashboard-header mb-8">
        <h1 class="page-title">Dashboard Operativo</h1>
        <p class="subtitle">Bienvenido al Sistema de Gestión de Expedientes Judiciales (SGED)</p>
      </header>

      <!-- KPI Grid -->
      <section class="kpi-grid mb-10">
        <app-kpi-card 
          label="Expedientes Totales" 
          [value]="stats.total" 
          icon="pi-folder" 
          color="#3b82f6"
          [trend]="12">
        </app-kpi-card>
        <app-kpi-card 
          label="Casos Activos" 
          [value]="stats.activos" 
          icon="pi-bolt" 
          color="#10b981"
          [trend]="5">
        </app-kpi-card>
        <app-kpi-card 
          label="Pendientes de Firma" 
          [value]="stats.pendientes" 
          icon="pi-clock" 
          color="#f59e0b"
          [trend]="-2">
        </app-kpi-card>
        <app-kpi-card 
          label="Cerrados este Mes" 
          [value]="stats.cerrados" 
          icon="pi-check-circle" 
          color="#8b5cf6"
          [trend]="8">
        </app-kpi-card>
      </section>

      <!-- Recent Activity Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2">
          <section class="card glass-panel shadow-lg">
            <div class="card-header">
              <h3 class="section-title"><i class="pi pi-history"></i> ACTIVIDAD RECIENTE</h3>
              <button class="btn btn-text btn-sm" routerLink="/expedientes">Ver todos <i class="pi pi-arrow-right"></i></button>
            </div>
            <div class="p-0 overflow-x-auto">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Expediente</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Último Movimiento</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of recientes">
                    <td><a [routerLink]="['/expedientes', item.id]" class="font-bold hover:text-blue-600 transition-colors">{{item.numero}}</a></td>
                    <td>{{item.tipoProcesoId}}</td>
                    <td><app-status-badge [status]="item.estadoId"></app-status-badge></td>
                    <td class="text-slate-500">{{item.fechaCreacion | date:'dd MMM, yyyy'}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div>
          <section class="card glass-panel shadow-lg h-full">
            <div class="card-header">
              <h3 class="section-title"><i class="pi pi-info-circle"></i> ESTADO DEL SISTEMA</h3>
            </div>
            <div class="p-6">
              <div class="system-status-item mb-6">
                <div class="flex justify-between mb-2">
                  <span class="text-sm font-medium">Almacenamiento (Total)</span>
                  <span class="text-sm text-slate-500">75%</span>
                </div>
                <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-blue-500" style="width: 75%"></div>
                </div>
              </div>

              <div class="system-status-item mb-6">
                <div class="flex justify-between mb-2">
                  <span class="text-sm font-medium">Sincronización SGT v2</span>
                  <span class="text-sm text-green-500 font-bold">ONLINE</span>
                </div>
                <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-green-500" style="width: 100%"></div>
                </div>
              </div>

              <div class="p-4 bg-blue-50 border border-blue-100 rounded-xl mt-10">
                <h4 class="text-blue-800 text-sm font-bold mb-2">Tip Élite UX</h4>
                <p class="text-blue-700 text-xs leading-relaxed">
                  Puedes utilizar el visor multiformato para abrir documentos PDF, Word, imágenes y videos directamente desde el detalle del expediente.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-wrapper { padding: var(--space-2); }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: var(--space-6);
    }
    
    .card {
      background: var(--surface-card);
      border-radius: var(--radius-lg);
      overflow: hidden;
      border: 1px solid var(--border);
    }

    .card-header {
      padding: var(--space-6);
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border);
    }

    .system-status-item {
      position: relative;
    }
    
    .btn-text {
      background: transparent;
      color: var(--primary);
      padding: var(--space-2);
      &:hover { color: var(--primary-hover); text-decoration: underline; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats = {
    total: 1247,
    activos: 856,
    pendientes: 312,
    cerrados: 80
  };

  recientes: any[] = [];

  constructor(private expedientesService: ExpedientesService) {}

  ngOnInit() {
    this.expedientesService.getExpedientes({ page: 0, size: 5, sort: 'fechaCreacion,desc' }).subscribe((res: any) => {
      this.recientes = res.data?.content || [];
    });
  }
}
