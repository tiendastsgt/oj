import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Documento } from '../../features/documentos/models/documento.model';

export interface ContenidoBlobResult {
  url: string;
  conversionFailed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentosService {
  private baseUrl = environment.apiUrl;

  getDocumentos(expedienteId: number): Observable<ApiResponse<Documento[]>> {
    return this.listar(expedienteId);
  }

  listar(expedienteId: number): Observable<ApiResponse<Documento[]>> {
    return this.http.get<ApiResponse<Documento[]>>(
      `${this.baseUrl}/expedientes/${expedienteId}/documentos`
    );
  }

  uploadDocumento(expedienteId: number, file: File, tipoDocumentoId?: number): Observable<HttpEvent<ApiResponse<Documento>>> {
    return this.cargar(expedienteId, file, tipoDocumentoId);
  }

  cargar(expedienteId: number, file: File, tipoDocumentoId?: number): Observable<HttpEvent<ApiResponse<Documento>>> {
    const form = new FormData();
    form.append('file', file);
    if (tipoDocumentoId) {
      form.append('tipoDocumentoId', String(tipoDocumentoId));
    }
    return this.http.post<ApiResponse<Documento>>(
      `${this.baseUrl}/expedientes/${expedienteId}/documentos`,
      form,
      {
        reportProgress: true,
        observe: 'events'
      }
    );
  }

  getDocumento(id: number): Observable<ApiResponse<Documento>> {
    return this.obtenerDetalle(id);
  }

  obtenerDetalle(id: number): Observable<ApiResponse<Documento>> {
    return this.http.get<ApiResponse<Documento>>(`${this.baseUrl}/documentos/${id}`);
  }

  getContenidoUrl(id: number, modo: 'inline' | 'attachment' = 'inline'): string {
    return `${this.baseUrl}/documentos/${id}/contenido?modo=${modo}`;
  }

  downloadDocumento(id: number): string {
    return this.getContenidoUrl(id, 'attachment');
  }

  streamDocumento(id: number): string {
    return this.getContenidoUrl(id, 'inline');
  }

  /**
   * Fetches document content as Blob via HttpClient (JWT-authenticated).
   * Returns url + conversionFailed flag (from X-SGED-Conversion-Failed header).
   */
  fetchContenidoBlob(id: number, modo: 'inline' | 'attachment' = 'inline'): Observable<ContenidoBlobResult> {
    const url = `${this.baseUrl}/documentos/${id}/contenido?modo=${modo}`;
    return this.http.get(url, { responseType: 'blob', observe: 'response' }).pipe(
      map(response => ({
        url: URL.createObjectURL(response.body!),
        conversionFailed: response.headers.get('X-SGED-Conversion-Failed') === 'true'
      }))
    );
  }

  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/documentos/${id}`);
  }

  registrarImpresion(id: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/documentos/${id}/impresion`, {});
  }

  constructor(private http: HttpClient) {}
}
