import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { AuditoriaResponse, AuditoriaFiltros } from '../models/auditoria.model';

interface PageableResponse {
  content: AuditoriaResponse[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {
  private readonly baseUrl = `${environment.apiUrl}/admin/auditoria`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/v1/admin/auditoria
   * Consulta logs de auditoría con filtros opcionales y paginación.
   */
  getAuditoria(filtros?: AuditoriaFiltros): Observable<ApiResponse<PageableResponse>> {
    let params = new HttpParams();

    if (filtros) {
      if (filtros.usuario) {
        params = params.set('usuario', filtros.usuario);
      }
      if (filtros.modulo) {
        params = params.set('modulo', filtros.modulo);
      }
      if (filtros.accion) {
        params = params.set('accion', filtros.accion);
      }
      if (filtros.fechaDesde) {
        params = params.set('fechaDesde', filtros.fechaDesde);
      }
      if (filtros.fechaHasta) {
        params = params.set('fechaHasta', filtros.fechaHasta);
      }
      if (filtros.recursoId !== undefined) {
        params = params.set('recursoId', filtros.recursoId.toString());
      }
      if (filtros.page !== undefined) {
        params = params.set('page', filtros.page.toString());
      }
      if (filtros.size !== undefined) {
        params = params.set('size', filtros.size.toString());
      }
      if (filtros.sort) {
        params = params.set('sort', filtros.sort);
      }
    }

    return this.http.get<ApiResponse<PageableResponse>>(this.baseUrl, { params });
  }

  /**
   * GET /api/v1/admin/auditoria/{id}
   * Obtiene el detalle de un log de auditoría específico.
   */
  getAuditoriaDetalle(id: number): Observable<ApiResponse<AuditoriaResponse>> {
    return this.http.get<ApiResponse<AuditoriaResponse>>(`${this.baseUrl}/${id}`);
  }
}
