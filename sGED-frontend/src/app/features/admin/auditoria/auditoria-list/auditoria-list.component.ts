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
  template: `
    <div class="card">
      <p-toolbar class="mb-4">
        <ng-template pTemplate="left">
          <h3 class="m-0">Auditoría</h3>
        </ng-template>
      </p-toolbar>

      <!-- Filtros -->
      <div class="grid mb-4" [formGroup]="filterForm">
        <div class="col-12 md:col-3">
          <label class="block mb-2">Usuario</label>
          <input
            pInputText
            type="text"
            placeholder="Buscar usuario"
            formControlName="usuario"
            class="w-full"
            (change)="aplicarFiltros()"
          />
        </div>
        <div class="col-12 md:col-3">
          <label class="block mb-2">Módulo</label>
          <input
            pInputText
            type="text"
            placeholder="Módulo"
            formControlName="modulo"
            class="w-full"
            (change)="aplicarFiltros()"
          />
        </div>
        <div class="col-12 md:col-3">
          <label class="block mb-2">Acción</label>
          <input
            pInputText
            type="text"
            placeholder="Acción"
            formControlName="accion"
            class="w-full"
            (change)="aplicarFiltros()"
          />
        </div>
        <div class="col-12 md:col-3">
          <label class="block mb-2">Recurso ID</label>
          <input
            pInputNumber
            placeholder="Recurso ID"
            formControlName="recursoId"
            class="w-full"
            (change)="aplicarFiltros()"
          />
        </div>
        <div class="col-12 md:col-6">
          <label class="block mb-2">Desde</label>
          <input
            type="datetime-local"
            formControlName="fechaDesde"
            pInputText
            class="w-full"
            (change)="aplicarFiltros()"
          />
        </div>
        <div class="col-12 md:col-6">
          <label class="block mb-2">Hasta</label>
          <input
            type="datetime-local"
            formControlName="fechaHasta"
            pInputText
            class="w-full"
            (change)="aplicarFiltros()"
          />
        </div>
      </div>

      <!-- Tabla de auditoría -->
      <p-table
        [value]="auditoria"
        [loading]="loading"
        [paginator]="true"
        [rows]="pageSize"
        [totalRecords]="totalRecords"
        [lazy]="true"
        (onLazyLoad)="onLazyLoad($event)"
      >
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="fecha">Fecha <p-sortIcon field="fecha"></p-sortIcon></th>
            <th>Usuario</th>
            <th>IP</th>
            <th>Módulo</th>
            <th>Acción</th>
            <th>Recurso ID</th>
            <th>Detalle</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-item>
          <tr>
            <td>{{ item.fecha | date : 'medium' }}</td>
            <td>{{ item.usuario }}</td>
            <td>{{ item.ip }}</td>
            <td>{{ item.modulo }}</td>
            <td>{{ item.accion }}</td>
            <td>{{ item.recursoId || '-' }}</td>
            <td class="truncate max-w-xs" [title]="item.detalle">{{ item.detalle }}</td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="7">No hay registros de auditoría</td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-toast></p-toast>
  `,
  styles: []
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
