import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { ErrorInterceptor } from './error.interceptor';

class MockAuthService {
  clearSession(): void {}
}

describe('ErrorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: MockAuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
      ]
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should clear session and redirect on 401', () => {
    const clearSpy = spyOn(authService, 'clearSession');
    const navigateSpy = spyOn(router, 'navigate');
    spyOnProperty(router, 'url', 'get').and.returnValue('/expedientes/1/documentos');

    http.get(`${environment.apiUrl}/expedientes/1`).subscribe({
      error: () => {
        expect(clearSpy).toHaveBeenCalled();
        expect(navigateSpy).toHaveBeenCalledWith(['/login']);
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/expedientes/1`);
    req.flush(
      { message: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' }
    );
  });
});
