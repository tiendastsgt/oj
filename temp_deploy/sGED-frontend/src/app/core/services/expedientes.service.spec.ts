import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { ExpedienteRequest, ExpedienteResponse } from '../models/expediente.model';
import { ApiResponse } from '../models/api-response.model';
import { Page } from '../models/page.model';
import { ExpedientesService } from './expedientes.service';

describe('ExpedientesService', () => {
  let service: ExpedientesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ExpedientesService]
    });
    service = TestBed.inject(ExpedientesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should request expedientes with paging and sort', () => {
    service.getExpedientes({ page: 0, size: 10, sort: 'fechaCreacion,desc' }).subscribe();
    const req = httpMock.expectOne((request) => {
      return (
        request.url === `${environment.apiUrl}/expedientes` &&
        request.params.get('page') === '0' &&
        request.params.get('size') === '10' &&
        request.params.get('sort') === 'fechaCreacion,desc'
      );
    });
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 } });
  });

  it('should create expediente', () => {
    const payload: ExpedienteRequest = {
      numero: 'EXP-1',
      tipoProcesoId: 1,
      juzgadoId: 1,
      estadoId: 1,
      fechaInicio: '2026-01-01',
      descripcion: 'Desc'
    };
    service.createExpediente(payload).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/expedientes`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
  });

  it('should pass through validation errors', () => {
    const response: ApiResponse<Page<ExpedienteResponse>> = {
      success: false,
      message: 'Error de validación',
      errors: ['El número ya existe']
    };
    service.getExpedientes({ page: 0, size: 10 }).subscribe({
      error: (error) => {
        expect(error.error.errors).toEqual(['El número ya existe']);
      }
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/expedientes?page=0&size=10`);
    req.flush(response, { status: 400, statusText: 'Bad Request' });
  });
});
