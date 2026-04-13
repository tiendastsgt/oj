import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { AuthInterceptor } from './auth.interceptor';

class MockAuthService {
  token: string | null = null;
  getToken(): string | null {
    return this.token;
  }
}

describe('AuthInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: MockAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
      ]
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add Authorization header when token exists', () => {
    authService.token = 'token-value';
    http.get(`${environment.apiUrl}/expedientes/1`).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/expedientes/1`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-value');
    req.flush({});
  });

  it('should not add Authorization header when token is missing', () => {
    authService.token = null;
    http.get(`${environment.apiUrl}/expedientes/1`).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/expedientes/1`);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });
});
