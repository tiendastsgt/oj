import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { EstadoExpediente, Juzgado, TipoProceso } from '../models/catalogos.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogosService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTiposProceso(): Observable<ApiResponse<TipoProceso[]>> {
    return this.http.get<ApiResponse<TipoProceso[]>>(`${this.baseUrl}/catalogos/tipos-proceso`);
  }

  getEstadosExpediente(): Observable<ApiResponse<EstadoExpediente[]>> {
    return this.http.get<ApiResponse<EstadoExpediente[]>>(`${this.baseUrl}/catalogos/estados-expediente`);
  }

  getJuzgados(): Observable<ApiResponse<Juzgado[]>> {
    return this.http.get<ApiResponse<Juzgado[]>>(`${this.baseUrl}/catalogos/juzgados`);
  }
}
