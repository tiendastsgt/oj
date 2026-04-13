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
}

@Injectable({
  providedIn: 'root'
})
export class ExpedientesService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getExpedientes(params: ExpedientesQuery): Observable<ApiResponse<Page<ExpedienteResponse>>> {
    let httpParams = new HttpParams()
      .set('page', params.page)
      .set('size', params.size);
    if (params.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }
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
