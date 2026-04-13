import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { PaginatorModule } from 'primeng/paginator';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuditoriaService } from '../../../../core/services/auditoria.service';
import { AuditoriaResponse, AuditoriaFiltros } from '../../../../core/models/auditoria.model';

@Component({
  selector: 'app-auditoria-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    InputNumberModule,
    PaginatorModule,
    ToastModule,
    ToolbarModule
  ],
  providers: [MessageService],
  templateUrl: './auditoria-list.component.html',
  styleUrls: ['./auditoria-list.component.scss']
})
export class AuditoriaListComponent implements OnInit, OnDestroy {
  auditoria: AuditoriaResponse[] = [];
  loading = false;
  pageSize = 50;
  totalRecords = 0;
  currentPage = 0;
  filterForm: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private auditoriaService: AuditoriaService,
    private messageService: MessageService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      usuario: [''],
      modulo: [''],
      accion: [''],
      recursoId: [null],
      fechaDesde: [null],
      fechaHasta: [null]
    });
  }

  ngOnInit(): void {
    this.cargarAuditoria();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getDotColor(modulo: string): string {
    switch (modulo.toLowerCase()) {
      case 'auth': return '#4ade80';
      case 'expedientes': return '#60a5fa';
      case 'documentos': return '#fbbf24';
      case 'security': return '#f87171';
      default: return '#9ca3af';
    }
  }

  getActivityIcon(modulo: string): string {
    switch (modulo.toLowerCase()) {
      case 'auth': return 'pi-sign-in';
      case 'expedientes': return 'pi-folder';
      case 'documentos': return 'pi-file-pdf';
      case 'security': return 'pi-shield';
      default: return 'pi-info-circle';
    }
  }

  cargarAuditoria(page = 0): void {
    this.loading = true;

    // Convertir fechas a formato ISO si existen
    const fechaDesde = this.filterForm.get('fechaDesde')?.value;
    const fechaHasta = this.filterForm.get('fechaHasta')?.value;

    const filtros: AuditoriaFiltros = {
      usuario: this.filterForm.get('usuario')?.value || undefined,
      modulo: this.filterForm.get('modulo')?.value || undefined,
      accion: this.filterForm.get('accion')?.value || undefined,
      recursoId: this.filterForm.get('recursoId')?.value || undefined,
      fechaDesde: fechaDesde ? new Date(fechaDesde).toISOString() : undefined,
      fechaHasta: fechaHasta ? new Date(fechaHasta).toISOString() : undefined,
      page,
      size: this.pageSize,
      sort: 'fecha,desc'
    };

    this.auditoriaService
      .getAuditoria(filtros)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.data?.content) {
            this.auditoria = response.data.content;
            this.totalRecords = response.data.pageable?.totalElements || 0;
            this.currentPage = page;
          }
          this.loading = false;
        },
        error: (err: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Error al cargar auditoría'
          });
          this.loading = false;
        }
      });
  }

  onLazyLoad(event: any): void {
    const page = event.first ? event.first / event.rows : 0;
    this.cargarAuditoria(page);
  }

  aplicarFiltros(): void {
    this.cargarAuditoria(0);
  }
}
