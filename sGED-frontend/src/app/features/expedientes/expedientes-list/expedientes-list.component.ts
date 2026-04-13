import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { ExpedientesService } from '../../../core/services/expedientes.service';
import { ExpedienteResponse } from '../../../core/models/expediente.model';
import { AuthService } from '../../../core/services/auth.service';
import { AuthUser } from '../../../core/models/auth-user.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';
import { CatalogosService } from '../../../core/services/catalogos.service';
import { TipoProceso, Juzgado } from '../../../core/models/catalogos.model';

type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-expedientes-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    TableModule, 
    ButtonModule, 
    ProgressBarModule,
    MessageModule,
    StatusBadgeComponent,
  ],
  templateUrl: './expedientes-list.component.html',
  styleUrls: ['./expedientes-list.component.scss'],
  providers: [DatePipe]
})
export class ExpedientesListComponent implements OnInit {
  expedientes: ExpedienteResponse[] = [];
  totalRecords = 0;
  rows = 10;
  first = 0;
  loading = false;
  errorMessage = '';

  private sortField = 'fechaCreacion';
  private sortDir: SortDirection = 'desc';
  currentUser: AuthUser | null = null;
  tiposProceso: TipoProceso[] = [];
  juzgados: Juzgado[] = [];

  constructor(
    private expedientesService: ExpedientesService,
    private authService: AuthService,
    private catalogosService: CatalogosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.cargarCatalogos();
    this.cargarExpedientes(0, this.rows, this.sortField, this.sortDir);
  }

  onLazyLoad(event: { first?: number; rows?: number; sortField?: string; sortOrder?: number }): void {
    const first = event.first ?? 0;
    const rows = event.rows ?? this.rows;
    const page = Math.floor(first / rows);
    const sortField = event.sortField ?? this.sortField;
    const sortDir: SortDirection = event.sortOrder === 1 ? 'asc' : 'desc';
    this.first = first;
    this.rows = rows;
    this.sortField = sortField;
    this.sortDir = sortDir;
    this.cargarExpedientes(page, rows, sortField, sortDir);
  }

  canCreate(): boolean {
    return ['ADMINISTRADOR', 'SECRETARIO', 'AUXILIAR'].includes(this.currentUser?.rol ?? '');
  }

  canEdit(): boolean {
    return ['ADMINISTRADOR', 'SECRETARIO'].includes(this.currentUser?.rol ?? '');
  }

  private cargarExpedientes(page: number, size: number, sortField: string, sortDir: SortDirection): void {
    // Usar setTimeout para evitar ExpressionChangedAfterItHasBeenCheckedError
    // provocado por el onLazyLoad de PrimeNG actualizando propiedades vinculadas
    setTimeout(() => {
      this.loading = true;
      this.errorMessage = '';
    });
    
    this.expedientesService.getExpedientes({ page, size, sort: `${sortField},${sortDir}` }).subscribe({
      next: (response) => {
        console.log('[DEBUG ExpedientesList] Raw Response:', response);
        const data = response.data;
        setTimeout(() => {
          this.expedientes = data?.content || [];
          this.totalRecords = data?.totalElements || 0;
          this.loading = false;
          console.log(`[DEBUG] Set ${this.expedientes.length} expedientes. Forcing CD...`);
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        console.error('[DEBUG ExpedientesList] Error loading:', error);
        setTimeout(() => {
          this.expedientes = [];
          this.totalRecords = 0;
          this.errorMessage = error?.error?.message || 'Error al cargar expedientes';
          this.loading = false;
        });
      }
    });
  }

  private cargarCatalogos(): void {
    this.catalogosService.getTiposProceso().subscribe({
      next: (res) => { this.tiposProceso = res.data ?? []; this.cdr.detectChanges(); },
      error: () => {}
    });
    this.catalogosService.getJuzgados().subscribe({
      next: (res) => { this.juzgados = res.data ?? []; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  getTipoProceso(id: number): string {
    return this.tiposProceso.find(t => t.id === id)?.nombre ?? String(id);
  }

  getJuzgado(id: number): string {
    return this.juzgados.find(j => j.id === id)?.nombre ?? String(id);
  }
}
