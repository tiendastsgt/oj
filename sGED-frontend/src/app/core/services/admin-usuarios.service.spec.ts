import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdminUsuariosService } from './admin-usuarios.service';
import { environment } from '../../../environments/environment';
import {
  CrearUsuarioRequest,
  ActualizarUsuarioRequest,
  UsuarioAdminResponse
} from '../models/admin-usuarios.model';

describe('AdminUsuariosService', () => {
  let service: AdminUsuariosService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/admin/usuarios`;

  const mockUsuario: UsuarioAdminResponse = {
    id: 1,
    username: 'user1',
    nombreCompleto: 'Usuario Uno',
    email: 'user1@test.com',
    rol: 'SECRETARIO',
    juzgado: 'Juzgado 1',
    activo: true,
    bloqueado: false,
    intentosFallidos: 0,
    debeCambiarPassword: false,
    fechaCreacion: '2026-01-20T10:00:00',
    fechaModificacion: '2026-01-20T10:00:00'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminUsuariosService]
    });

    service = TestBed.inject(AdminUsuariosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crearse el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debe GET usuarios sin filtros', () => {
    service.getUsuarios().subscribe((response) => {
      expect(response.data?.content.length).toBe(1);
    });

    const req = httpMock.expectOne((request) => request.url === baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush({
      data: { content: [mockUsuario], pageable: { totalElements: 1 } }
    });
  });

  it('debe GET usuarios con filtros', () => {
    service
      .getUsuarios({
        username: 'user',
        activo: true,
        page: 0,
        size: 20
      })
      .subscribe();

    const req = httpMock.expectOne((request) => {
      return request.url === baseUrl && request.params.has('username');
    });
    expect(req.request.params.get('username')).toBe('user');
    expect(req.request.params.get('activo')).toBe('true');
    req.flush({ data: { content: [mockUsuario] } });
  });

  it('debe POST crear nuevo usuario', () => {
    const newUserRequest: CrearUsuarioRequest = {
      username: 'newuser',
      nombreCompleto: 'Nuevo Usuario',
      email: 'new@test.com',
      rolId: 1,
      juzgadoId: 1
    };

    service.createUsuario(newUserRequest).subscribe((response) => {
      expect(response.data?.id).toBe(1);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newUserRequest);
    req.flush({ data: mockUsuario });
  });

  it('debe GET usuario por id', () => {
    service.getUsuario(1).subscribe((response) => {
      expect(response.data?.username).toBe('user1');
    });

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockUsuario });
  });

  it('debe PUT actualizar usuario', () => {
    const updateRequest: ActualizarUsuarioRequest = {
      nombreCompleto: 'Usuario Actualizado',
      email: 'updated@test.com'
    };

    service.updateUsuario(1, updateRequest).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateRequest);
    req.flush({ data: mockUsuario });
  });

  it('debe POST reset password', () => {
    service.resetPassword(1).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/1/reset-password`);
    expect(req.request.method).toBe('POST');
    req.flush({ data: null });
  });

  it('debe POST bloquear usuario', () => {
    service.bloquearUsuario(1).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/1/bloquear`);
    expect(req.request.method).toBe('POST');
    req.flush({ data: null });
  });

  it('debe POST desbloquear usuario', () => {
    service.desbloquearUsuario(1).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/1/desbloquear`);
    expect(req.request.method).toBe('POST');
    req.flush({ data: null });
  });
});
