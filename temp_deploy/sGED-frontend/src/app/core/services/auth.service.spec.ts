import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { LoginResponseData } from '../models/login-response.model';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let storage: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, StorageService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    storage = TestBed.inject(StorageService);
    sessionStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('should store token and user on login', () => {
    const response: ApiResponse<LoginResponseData> = {
      success: true,
      data: {
        token: 'token-value',
        username: 'jperez',
        nombreCompleto: 'Juan Perez',
        rol: 'SECRETARIO',
        juzgado: 'Juzgado Primero',
        debeCambiarPassword: false
      }
    };

    service.login({ username: 'jperez', password: 'Secret123' }).subscribe((data) => {
      expect(data.token).toBe('token-value');
      expect(service.getToken()).toBe('token-value');
      expect(service.getCurrentUser()?.username).toBe('jperez');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(response);
  });

  it('should clear session on logout', () => {
    storage.setItem('sged_auth_token', 'token-value');
    storage.setJson('sged_auth_user', {
      username: 'jperez',
      nombreCompleto: 'Juan Perez',
      rol: 'SECRETARIO',
      debeCambiarPassword: false
    });

    service.logout().subscribe({
      complete: () => {
        expect(service.getToken()).toBeNull();
        expect(service.getCurrentUser()).toBeNull();
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
  });
});
