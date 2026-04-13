import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  ActualizarUsuarioRequest,
  CrearUsuarioRequest,
  ResetPasswordRequest,
  UsuarioAdminResponse,
  UsuarioListaFiltros
} from '../models/admin-usuarios.model';

interface PageableResponse {
  content: UsuarioAdminResponse[];
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
export class AdminUsuariosService {
  private readonly baseUrl = `${environment.apiUrl}/admin/usuarios`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/v1/admin/usuarios
   * Lista usuarios con filtros opcionales y paginación.
   */
  getUsuarios(filtros?: UsuarioListaFiltros): Observable<ApiResponse<PageableResponse>> {
    let params = new HttpParams();

    if (filtros) {
      if (filtros.rolId !== undefined) {
        params = params.set('rolId', filtros.rolId.toString());
      }
      if (filtros.juzgadoId !== undefined) {
        params = params.set('juzgadoId', filtros.juzgadoId.toString());
      }
      if (filtros.activo !== undefined) {
        params = params.set('activo', filtros.activo.toString());
      }
      if (filtros.bloqueado !== undefined) {
        params = params.set('bloqueado', filtros.bloqueado.toString());
      }
      if (filtros.username) {
        params = params.set('username', filtros.username);
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
   * POST /api/v1/admin/usuarios
   * Crea un nuevo usuario.
   */
  createUsuario(request: CrearUsuarioRequest): Observable<ApiResponse<UsuarioAdminResponse>> {
    return this.http.post<ApiResponse<UsuarioAdminResponse>>(this.baseUrl, request);
  }

  /**
   * GET /api/v1/admin/usuarios/{id}
   * Obtiene el detalle de un usuario específico.
   */
  getUsuario(id: number): Observable<ApiResponse<UsuarioAdminResponse>> {
    return this.http.get<ApiResponse<UsuarioAdminResponse>>(`${this.baseUrl}/${id}`);
  }

  /**
   * PUT /api/v1/admin/usuarios/{id}
   * Actualiza datos de un usuario.
   */
  updateUsuario(id: number, request: ActualizarUsuarioRequest): Observable<ApiResponse<UsuarioAdminResponse>> {
    return this.http.put<ApiResponse<UsuarioAdminResponse>>(`${this.baseUrl}/${id}`, request);
  }

  /**
   * POST /api/v1/admin/usuarios/{id}/reset-password
   * Resetea la contraseña de un usuario.
   */
  resetPassword(id: number, request?: ResetPasswordRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/${id}/reset-password`, request || {});
  }

  /**
   * POST /api/v1/admin/usuarios/{id}/bloquear
   * Bloquea un usuario.
   */
  bloquearUsuario(id: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/${id}/bloquear`, {});
  }

  /**
   * POST /api/v1/admin/usuarios/{id}/desbloquear
   * Desbloquea un usuario.
   */
  desbloquearUsuario(id: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/${id}/desbloquear`, {});
  }
}
