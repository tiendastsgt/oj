import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { BusquedaExpedientesService } from './busqueda-expedientes.service';

describe('BusquedaExpedientesService', () => {
  let service: BusquedaExpedientesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BusquedaExpedientesService]
    });
    service = TestBed.inject(BusquedaExpedientesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should call buscarRapida with query params', () => {
    service.buscarRapida('EXP-1', { page: 0, size: 10, sort: 'numero,asc' }).subscribe();
    const req = httpMock.expectOne((request) => {
      return (
        request.url === `${environment.apiUrl}/expedientes/busqueda/rapida` &&
        request.params.get('numero') === 'EXP-1' &&
        request.params.get('page') === '0' &&
        request.params.get('size') === '10' &&
        request.params.get('sort') === 'numero,asc'
      );
    });
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 } });
  });

  it('should call buscarAvanzada with body and params', () => {
    service.buscarAvanzada({ numero: 'EXP-1' }, { page: 1, size: 25, sort: 'fechaInicio,desc' }).subscribe();
    const req = httpMock.expectOne((request) => {
      return (
        request.url === `${environment.apiUrl}/expedientes/busqueda/avanzada` &&
        request.params.get('page') === '1' &&
        request.params.get('size') === '25' &&
        request.params.get('sort') === 'fechaInicio,desc'
      );
    });
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ numero: 'EXP-1' });
    req.flush({ success: true, data: { content: [], page: 1, size: 25, totalElements: 0, totalPages: 0 } });
  });
});
