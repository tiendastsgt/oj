import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const isApiRequest = req.url.startsWith(environment.apiUrl);
        if (isApiRequest) {
          if (error.status === 401) {
            // Token inválido o expirado: limpiar sesión y redirigir a login
            this.authService.clearSession();
            if (this.router.url !== '/login') {
              this.router.navigate(['/login']);
            }
          } else if (error.status === 403) {
            // Autenticado pero sin permiso: NO limpiar sesión, solo redirigir
            if (this.router.url !== '/login') {
              this.router.navigate(['/expedientes']);
            }
          }
        }
        return throwError(() => error);
      })
    );
  }
}
