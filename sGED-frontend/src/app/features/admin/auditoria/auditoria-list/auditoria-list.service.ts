import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AuditoriaService } from '../../../../core/services/auditoria.service';
import { AuditoriaListDto } from './auditoria-list.dto';
import { AuditoriaFiltros, AuditoriaResponse, LoadState } from './auditoria-list.types';

@Injectable()
export class AuditoriaListService {
  private readonly destroyRef   = inject(DestroyRef);
  private readonly auditoriaApi = inject(AuditoriaService);
  private readonly msgSvc       = inject(MessageService);
  private readonly fb           = inject(FormBuilder);

  readonly dto = new AuditoriaListDto();

  readonly filterForm: FormGroup = this.fb.group({
    usuario:    [''],
    modulo:     [''],
    accion:     [''],
    recursoId:  [null],
    fechaDesde: [null],
    fechaHasta: [null]
  });

  constructor() {
    this.cargarAuditoria();
  }

  getDotColor(modulo: string): string {
    switch (modulo.toLowerCase()) {
      case 'auth':        return '#4ade80';
      case 'expedientes': return '#60a5fa';
      case 'documentos':  return '#fbbf24';
      case 'security':    return '#f87171';
      default:            return '#9ca3af';
    }
  }

  getActivityIcon(modulo: string): string {
    switch (modulo.toLowerCase()) {
      case 'auth':        return 'pi-sign-in';
      case 'expedientes': return 'pi-folder';
      case 'documentos':  return 'pi-file-pdf';
      case 'security':    return 'pi-shield';
      default:            return 'pi-info-circle';
    }
  }

  cargarAuditoria(page = 0): void {
    this.dto.state.set(LoadState.Loading);

    const fechaDesde = this.filterForm.get('fechaDesde')?.value;
    const fechaHasta = this.filterForm.get('fechaHasta')?.value;

    const filtros: AuditoriaFiltros = {
      usuario:    this.filterForm.get('usuario')?.value  || undefined,
      modulo:     this.filterForm.get('modulo')?.value   || undefined,
      accion:     this.filterForm.get('accion')?.value   || undefined,
      recursoId:  this.filterForm.get('recursoId')?.value || undefined,
      fechaDesde: fechaDesde ? new Date(fechaDesde).toISOString() : undefined,
      fechaHasta: fechaHasta ? new Date(fechaHasta).toISOString() : undefined,
      page,
      size: this.dto.pageSize(),
      sort: 'fecha,desc'
    };

    this.auditoriaApi
      .getAuditoria(filtros)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          if (response.data?.content) {
            this.dto.auditoria.set(response.data.content);
            this.dto.totalRecords.set(response.data.pageable?.totalElements || 0);
            this.dto.currentPage.set(page);
          }
          this.dto.state.set(LoadState.Success);
        },
        error: (err: any) => {
          this.dto.state.set(LoadState.Error);
          this.msgSvc.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Error al cargar auditoría'
          });
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

  countByModulo(keyword: string): number {
    return this.dto.auditoria().filter(
      a => a.modulo.toLowerCase().includes(keyword.toLowerCase())
    ).length;
  }

  getResourceLabel(item: AuditoriaResponse): string {
    if (!item.recursoId) return '';
    const mod = item.modulo.toLowerCase();
    if (mod.includes('expediente')) return `Expediente #${item.recursoId}`;
    if (mod.includes('documento'))  return `Documento #${item.recursoId}`;
    return `Recurso #${item.recursoId}`;
  }
}
