import { Injectable, DestroyRef, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, startWith, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import { ExpedientesService } from '../../core/services/expedientes.service';
import { AuthService } from '../../core/services/auth.service';
import { AuditoriaService } from '../../core/services/auditoria.service';

import { DashboardDto } from './dashboard.dto';

@Injectable()
export class DashboardService {
  private readonly expedientesService = inject(ExpedientesService);
  private readonly authService        = inject(AuthService);
  private readonly auditoriaService   = inject(AuditoriaService);
  private readonly destroyRef         = inject(DestroyRef);
  private readonly fb                 = inject(FormBuilder);

  public dto = new DashboardDto();

  // Expuesto al template vía component.ts (no puede vivir en el DTO puro)
  public filterForm: FormGroup = this.fb.group({
    estadoId:   [null],
    juzgadoId:  [null],
    fechaDesde: [null],
    fechaHasta: [null],
  });

  constructor() {
    this.initUserName();
    this.cargarEstadisticas();
    this.observarFiltros();
    this.cargarAuditoria();
  }

  private initUserName(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.dto.userName.set(user.nombreCompleto?.split(' ')[0] || user.username);
    }
  }

  private cargarEstadisticas(): void {
    this.expedientesService.getEstadisticas()
      .pipe(takeUntilDestroyed(this.destroyRef), catchError(() => of(null)))
      .subscribe(res => {
        this.dto.stats.set(res?.data ?? {
          totalExpedientes: 0, pendientes: 0, enProceso: 0, resueltos: 0, archivados: 0,
        });
      });
  }

  // switchMap cancela peticiones obsoletas cuando el usuario cambia filtros
  // rápidamente, evitando race conditions sobre expedientesRecientes.
  private observarFiltros(): void {
    this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.value),
      tap(() => this.dto.loading.set(true)),
      switchMap(filtros => this.expedientesService.getExpedientes({
        page: 0, size: 5, sort: 'fechaCreacion,desc',
        estadoId:   filtros.estadoId   ?? undefined,
        juzgadoId:  filtros.juzgadoId  ?? undefined,
        fechaDesde: filtros.fechaDesde ?? undefined,
        fechaHasta: filtros.fechaHasta ?? undefined,
      }).pipe(catchError(() => of(null)))),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(res => {
      this.dto.expedientesRecientes.set(res?.data?.content ?? []);
      this.dto.loading.set(false);
    });
  }

  private cargarAuditoria(): void {
    this.auditoriaService
      .getAuditoria({ page: 0, size: 5, sort: 'fecha,desc' })
      .pipe(takeUntilDestroyed(this.destroyRef), catchError(() => of(null)))
      .subscribe(res => {
        this.dto.actividadReciente.set(res?.data?.content ?? []);
        this.dto.loadingAuditoria.set(false);
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
