import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { AuthUser } from '../models/auth-user.model';
import { ChangePasswordRequest } from '../models/change-password-request.model';
import { LoginRequest } from '../models/login-request.model';
import { LoginResponseData } from '../models/login-response.model';
import { StorageService } from './storage.service';

const TOKEN_KEY = 'sged_auth_token';
const USER_KEY = 'sged_auth_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private storage: StorageService) {
    const storedUser = this.storage.getJson<AuthUser>(USER_KEY);
    if (storedUser) {
      this.currentUserSubject.next(storedUser);
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponseData> {
    return this.http
      .post<ApiResponse<LoginResponseData>>(`${this.baseUrl}/auth/login`, credentials)
      .pipe(
        map((response: ApiResponse<LoginResponseData>) => {
          if (!response.data) {
            throw new Error('Respuesta de autenticación inválida');
          }
          return response.data;
        }),
        tap((data) => {
          this.storage.setItem(TOKEN_KEY, data.token);
          const user: AuthUser = {
            username: data.username,
            nombreCompleto: data.nombreCompleto,
            rol: data.rol,
            juzgado: data.juzgado,
            debeCambiarPassword: data.debeCambiarPassword
          };
          this.storage.setJson(USER_KEY, user);
          this.currentUserSubject.next(user);
        })
      );
  }

  logout(): Observable<void> {
    const token = this.getToken();
    const request$ = token
      ? this.http.post<ApiResponse<void>>(`${this.baseUrl}/auth/logout`, {})
      : of({ success: true } as ApiResponse<void>);
    return request$.pipe(
      catchError(() => of({ success: false } as ApiResponse<void>)),
      tap(() => this.clearSession()),
      map(() => undefined)
    );
  }

  changePassword(payload: ChangePasswordRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/auth/cambiar-password`, payload);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    const payload = this.getTokenPayload(token);
    if (payload?.exp) {
      const isExpired = Date.now() >= payload.exp * 1000;
      if (isExpired) {
        this.clearSession();
        return false;
      }
    }
    return true;
  }

  getCurrentUser(): AuthUser | null {
    return this.storage.getJson<AuthUser>(USER_KEY);
  }

  getToken(): string | null {
    return this.storage.getItem(TOKEN_KEY);
  }

  clearSession(): void {
    this.storage.removeItem(TOKEN_KEY);
    this.storage.removeItem(USER_KEY);
    this.currentUserSubject.next(null);
  }

  private getTokenPayload(token: string): { exp?: number } | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) {
        return null;
      }
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
      const decoded = atob(padded);
      return JSON.parse(decoded) as { exp?: number };
    } catch {
      return null;
    }
  }
}
