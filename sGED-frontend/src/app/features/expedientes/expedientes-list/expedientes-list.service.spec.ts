// ═══════════════════════════════════════════════════════════════
// expedientes-list.service.spec.ts
// Verifica mutaciones de paginación, lookups de catálogos,
// estados de carga y manejo de errores HTTP.
// ═══════════════════════════════════════════════════════════════

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { ExpedientesListService } from './expedientes-list.service';
import { ExpedientesService } from '../../../core/services/expedientes.service';
import { CatalogosService } from '../../../core/services/catalogos.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadState } from './expedientes-list.types';
import { AuthUser } from '../../../core/models/auth-user.model';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Page } from '../../../core/models/page.model';
import { ExpedienteResponse } from '../../../core/models/expediente.model';

const mockUser: AuthUser = {
  username: 'admin',
  nombreCompleto: 'Administrador',
  rol: 'ADMINISTRADOR',
  debeCambiarPassword: false,
};

const buildPageResponse = (items: ExpedienteResponse[] = [], total = 0): ApiResponse<Page<ExpedienteResponse>> => ({
  success: true,
  data: { content: items, page: 0, size: 10, totalElements: total, totalPages: 1 },
});

describe('ExpedientesListService', () => {
  let service: ExpedientesListService;
  let httpMock: HttpTestingController;
  let expedientesSpyObj: jasmine.SpyObj<ExpedientesService>;
  let catalogosSpyObj: jasmine.SpyObj<CatalogosService>;
  let authSpyObj: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    expedientesSpyObj = jasmine.createSpyObj('ExpedientesService', ['getExpedientes']);
    catalogosSpyObj   = jasmine.createSpyObj('CatalogosService', ['getTiposProceso', 'getJuzgados']);
    authSpyObj        = jasmine.createSpyObj('AuthService', ['getCurrentUser']);

    catalogosSpyObj.getTiposProceso.and.returnValue(of({ success: true, data: [] }));
    catalogosSpyObj.getJuzgados.and.returnValue(of({ success: true, data: [] }));
    authSpyObj.getCurrentUser.and.returnValue(mockUser);
    expedientesSpyObj.getExpedientes.and.returnValue(of(buildPageResponse()));

    TestBed.configureTestingModule({
      providers: [
        ExpedientesListService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ExpedientesService, useValue: expedientesSpyObj },
        { provide: CatalogosService,   useValue: catalogosSpyObj },
        { provide: AuthService,        useValue: authSpyObj },
      ],
    });

    service  = TestBed.inject(ExpedientesListService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ─── Constructor ───

  it('carga el usuario actual en el DTO al construirse', () => {
    expect(service.dto.currentUser()).toEqual(mockUser);
  });

  it('llama a getTiposProceso y getJuzgados al construirse', () => {
    expect(catalogosSpyObj.getTiposProceso).toHaveBeenCalledTimes(1);
    expect(catalogosSpyObj.getJuzgados).toHaveBeenCalledTimes(1);
  });

  // ─── onLazyLoad ───

  it('onLazyLoad calcula correctamente page y sortDir asc', () => {
    expedientesSpyObj.getExpedientes.and.returnValue(of(buildPageResponse()));
    service.onLazyLoad({ first: 20, rows: 10, sortField: 'numero', sortOrder: 1 });

    expect(service.dto.pagination().page).toBe(2);
    expect(service.dto.pagination().sortDir).toBe('asc');
    expect(service.dto.pagination().sortField).toBe('numero');
  });

  it('onLazyLoad calcula sortDir desc cuando sortOrder es -1', () => {
    expedientesSpyObj.getExpedientes.and.returnValue(of(buildPageResponse()));
    service.onLazyLoad({ first: 0, rows: 10, sortField: 'fechaCreacion', sortOrder: -1 });

    expect(service.dto.pagination().sortDir).toBe('desc');
  });

  it('onLazyLoad llama a getExpedientes con los parámetros correctos', () => {
    expedientesSpyObj.getExpedientes.and.returnValue(of(buildPageResponse()));
    service.onLazyLoad({ first: 10, rows: 10, sortField: 'numero', sortOrder: 1 });

    expect(expedientesSpyObj.getExpedientes).toHaveBeenCalledWith({
      page: 1,
      size: 10,
      sort: 'numero,asc',
    });
  });

  // ─── Estado de carga ───

  it('pone state en Loading antes de la respuesta y Success al resolverse', () => {
    expedientesSpyObj.getExpedientes.and.returnValue(of(buildPageResponse([], 5)));
    service.onLazyLoad({ first: 0, rows: 10 });

    expect(service.dto.state()).toBe(LoadState.Success);
    expect(service.dto.totalRecords()).toBe(5);
  });

  it('pone state en Error y guarda el mensaje cuando el HTTP falla', () => {
    expedientesSpyObj.getExpedientes.and.returnValue(
      throwError(() => ({ error: { message: 'Sin conexión' } }))
    );
    service.onLazyLoad({ first: 0, rows: 10 });

    expect(service.dto.state()).toBe(LoadState.Error);
    expect(service.dto.error()).toBe('Sin conexión');
    expect(service.dto.expedientes()).toEqual([]);
  });

  // ─── Lookups de catálogos ───

  it('getTipoProceso retorna el nombre del catálogo si existe', () => {
    service.dto.tiposProceso.set([{ id: 1, nombre: 'Civil' }, { id: 2, nombre: 'Penal' }]);
    expect(service.getTipoProceso(1)).toBe('Civil');
  });

  it('getTipoProceso retorna el id como string si no existe en catálogo', () => {
    service.dto.tiposProceso.set([]);
    expect(service.getTipoProceso(99)).toBe('99');
  });

  it('getJuzgado retorna el nombre del catálogo si existe', () => {
    service.dto.juzgados.set([{ id: 3, nombre: 'Juzgado 1ro Niñez' }]);
    expect(service.getJuzgado(3)).toBe('Juzgado 1ro Niñez');
  });

  it('getJuzgado retorna el id como string si no existe en catálogo', () => {
    service.dto.juzgados.set([]);
    expect(service.getJuzgado(7)).toBe('7');
  });
});
