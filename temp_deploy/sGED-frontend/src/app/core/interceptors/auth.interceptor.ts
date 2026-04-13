import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();
    
    // Más robusto: verifica si la URL contiene el endpoint de la API
    // o si es una ruta relativa que comienza con el apiUrl definido
    const isApiRequest = req.url.startsWith(environment.apiUrl) || 
                         req.url.includes('/api/v1/');

    console.log(`[AuthInterceptor] Request: ${req.url}, isApiRequest: ${isApiRequest}, hasToken: ${!!token}`);

    if (token && isApiRequest) {
      const sanitizedToken = token.trim();
      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${sanitizedToken}` }
      });
      console.log(`[AuthInterceptor] Token attached to: ${req.url}`);
      return next.handle(authReq);
    }

    if (!token && isApiRequest) {
      console.warn('[AuthInterceptor] No hay token disponible para la petición:', req.url);
    }

    return next.handle(req);
  }
}
