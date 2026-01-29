import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { BusquedaAvanzadaRequest, ExpedienteBusquedaResponse } from '../models/busqueda.model';
import { Page } from '../models/page.model';

export interface BusquedaQueryParams {
  page: number;
  size: number;
  sort?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BusquedaExpedientesService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  buscarRapida(
    numero: string,
    params: BusquedaQueryParams
  ): Observable<ApiResponse<Page<ExpedienteBusquedaResponse>>> {
    let httpParams = new HttpParams()
      .set('numero', numero)
      .set('page', params.page)
      .set('size', params.size);
    if (params.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }
    return this.http.get<ApiResponse<Page<ExpedienteBusquedaResponse>>>(
      `${this.baseUrl}/expedientes/busqueda/rapida`,
      { params: httpParams }
    );
  }

  buscarAvanzada(
    filtros: BusquedaAvanzadaRequest,
    params: BusquedaQueryParams
  ): Observable<ApiResponse<Page<ExpedienteBusquedaResponse>>> {
    let httpParams = new HttpParams()
      .set('page', params.page)
      .set('size', params.size);
    if (params.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }
    return this.http.post<ApiResponse<Page<ExpedienteBusquedaResponse>>>(
      `${this.baseUrl}/expedientes/busqueda/avanzada`,
      filtros,
      { params: httpParams }
    );
  }
}
