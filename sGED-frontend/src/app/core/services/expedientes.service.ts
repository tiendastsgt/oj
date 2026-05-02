import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { ExpedienteRequest, ExpedienteResponse } from '../models/expediente.model';
import { Page } from '../models/page.model';

export interface ExpedientesQuery {
  page: number;
  size: number;
  sort?: string;
  estadoId?: number;
  juzgadoId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface ExpedienteEstadisticas {
  totalExpedientes: number;
  pendientes: number;
  enProceso: number;
  resueltos: number;
  archivados: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExpedientesService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getEstadisticas(): Observable<ApiResponse<ExpedienteEstadisticas>> {
    return this.http.get<ApiResponse<ExpedienteEstadisticas>>(`${this.baseUrl}/expedientes/estadisticas`);
  }

  getExpedientes(params: ExpedientesQuery): Observable<ApiResponse<Page<ExpedienteResponse>>> {
    let httpParams = new HttpParams()
      .set('page', params.page)
      .set('size', params.size);
    if (params.sort)       httpParams = httpParams.set('sort', params.sort);
    if (params.estadoId)   httpParams = httpParams.set('estadoId', params.estadoId);
    if (params.juzgadoId)  httpParams = httpParams.set('juzgadoId', params.juzgadoId);
    if (params.fechaDesde) httpParams = httpParams.set('fechaDesde', params.fechaDesde);
    if (params.fechaHasta) httpParams = httpParams.set('fechaHasta', params.fechaHasta);
    return this.http.get<ApiResponse<Page<ExpedienteResponse>>>(`${this.baseUrl}/expedientes`, {
      params: httpParams
    });
  }

  getExpediente(id: number): Observable<ApiResponse<ExpedienteResponse>> {
    return this.http.get<ApiResponse<ExpedienteResponse>>(`${this.baseUrl}/expedientes/${id}`);
  }

  createExpediente(payload: ExpedienteRequest): Observable<ApiResponse<ExpedienteResponse>> {
    return this.http.post<ApiResponse<ExpedienteResponse>>(`${this.baseUrl}/expedientes`, payload);
  }

  updateExpediente(id: number, payload: ExpedienteRequest): Observable<ApiResponse<ExpedienteResponse>> {
    return this.http.put<ApiResponse<ExpedienteResponse>>(`${this.baseUrl}/expedientes/${id}`, payload);
  }
}
