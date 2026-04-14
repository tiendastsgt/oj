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
    const isApiRequest = req.url.startsWith(environment.apiUrl) || 
                         req.url.includes('/api/v1/');

    if (token && isApiRequest) {
      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token.trim()}` }
      });
      return next.handle(authReq);
    }

    return next.handle(req);
  }
}
