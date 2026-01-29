import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { ExpedientesService } from '../../../core/services/expedientes.service';
import { ExpedienteResponse } from '../../../core/models/expediente.model';
import { AuthService } from '../../../core/services/auth.service';
import { AuthUser } from '../../../core/models/auth-user.model';

type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-expedientes-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, ButtonModule, CardModule, MessageModule],
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

  constructor(
    private expedientesService: ExpedientesService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
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
    this.loading = true;
    this.errorMessage = '';
    const sort = `${sortField},${sortDir}`;
    this.expedientesService.getExpedientes({ page, size, sort }).subscribe({
      next: (response) => {
        const data = response.data;
        this.expedientes = data?.content ?? [];
        this.totalRecords = data?.totalElements ?? 0;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message ?? 'No se pudo cargar expedientes';
      }
    });
  }
}
