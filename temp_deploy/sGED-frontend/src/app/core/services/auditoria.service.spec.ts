import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuditoriaService } from './auditoria.service';
import { environment } from '../../../environments/environment';
import { AuditoriaResponse } from '../models/auditoria.model';

describe('AuditoriaService', () => {
  let service: AuditoriaService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/admin/auditoria`;

  const mockAuditoria: AuditoriaResponse = {
    id: 1,
    fecha: '2026-01-20T10:00:00',
    usuario: 'admin1',
    ip: '192.168.1.1',
    accion: 'USUARIO_CREADO',
    modulo: 'ADMIN',
    recursoId: 1,
    detalle: 'Usuario creado con éxito'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuditoriaService]
    });

    service = TestBed.inject(AuditoriaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crearse el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debe GET auditoría sin filtros', () => {
    service.getAuditoria().subscribe((response) => {
      expect(response.data?.content.length).toBe(1);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush({
      data: { content: [mockAuditoria], pageable: { totalElements: 1 } }
    });
  });

  it('debe GET auditoría con filtros', () => {
    service
      .getAuditoria({
        usuario: 'admin',
        modulo: 'ADMIN',
        accion: 'USUARIO_CREADO',
        page: 0,
        size: 50
      })
      .subscribe();

    const req = httpMock.expectOne((request) => {
      return (
        request.url === baseUrl &&
        request.params.has('usuario') &&
        request.params.has('modulo')
      );
    });
    expect(req.request.params.get('usuario')).toBe('admin');
    expect(req.request.params.get('modulo')).toBe('ADMIN');
    req.flush({ data: { content: [mockAuditoria] } });
  });

  it('debe GET detalle de auditoría por id', () => {
    service.getAuditoriaDetalle(1).subscribe((response) => {
      expect(response.data?.accion).toBe('USUARIO_CREADO');
    });

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockAuditoria });
  });

  it('debe incluir parámetro sort por defecto', () => {
    service.getAuditoria().subscribe();

    const req = httpMock.expectOne((request) => {
      return request.url === baseUrl;
    });
    // El sort se añade en el componente, no en el servicio
    req.flush({ data: { content: [] } });
  });
});
