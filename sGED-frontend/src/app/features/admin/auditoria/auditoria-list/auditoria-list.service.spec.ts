import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

import { AuditoriaListService } from './auditoria-list.service';
import { AuditoriaService } from '../../../../core/services/auditoria.service';
import { LoadState } from './auditoria-list.types';

const mockResponse: any = {
  data: {
    content: [
      { id: 1, fecha: '2026-01-20T10:00:00', usuario: 'admin', ip: '127.0.0.1',
        accion: 'LOGIN', modulo: 'auth', detalle: 'ok' }
    ],
    pageable: { totalElements: 1, pageNumber: 0, pageSize: 50, totalPages: 1 }
  }
};

describe('AuditoriaListService', () => {
  let service: AuditoriaListService;
  let auditoriaApiSpy: jasmine.SpyObj<AuditoriaService>;

  beforeEach(() => {
    auditoriaApiSpy = jasmine.createSpyObj('AuditoriaService', ['getAuditoria']);
    auditoriaApiSpy.getAuditoria.and.returnValue(of(mockResponse));

    TestBed.configureTestingModule({
      providers: [
        AuditoriaListService,
        MessageService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuditoriaService, useValue: auditoriaApiSpy }
      ]
    });

    service = TestBed.inject(AuditoriaListService);
  });

  it('carga auditoría en el constructor y pone state en Success', () => {
    expect(auditoriaApiSpy.getAuditoria).toHaveBeenCalledTimes(1);
    expect(service.dto.auditoria().length).toBe(1);
    expect(service.dto.state()).toBe(LoadState.Success);
    expect(service.dto.totalRecords()).toBe(1);
  });

  it('cargarAuditoria pone state en Error ante fallo', () => {
    auditoriaApiSpy.getAuditoria.and.returnValue(throwError(() => ({ error: { message: 'Error' } })));
    service.cargarAuditoria();
    expect(service.dto.state()).toBe(LoadState.Error);
  });

  it('onLazyLoad calcula la página correctamente', () => {
    spyOn(service, 'cargarAuditoria');
    service.onLazyLoad({ first: 100, rows: 50 });
    expect(service.cargarAuditoria).toHaveBeenCalledWith(2);
  });

  it('onLazyLoad usa página 0 cuando first es 0', () => {
    spyOn(service, 'cargarAuditoria');
    service.onLazyLoad({ first: 0, rows: 50 });
    expect(service.cargarAuditoria).toHaveBeenCalledWith(0);
  });

  it('aplicarFiltros carga desde página 0', () => {
    spyOn(service, 'cargarAuditoria');
    service.aplicarFiltros();
    expect(service.cargarAuditoria).toHaveBeenCalledWith(0);
  });

  it('filterForm tiene los controles correctos', () => {
    expect(service.filterForm.get('usuario')).toBeTruthy();
    expect(service.filterForm.get('modulo')).toBeTruthy();
    expect(service.filterForm.get('accion')).toBeTruthy();
  });

  it('countByModulo filtra correctamente la lista cargada', () => {
    expect(service.countByModulo('auth')).toBe(1);
    expect(service.countByModulo('expediente')).toBe(0);
  });

  it('getDotColor devuelve color correcto por módulo', () => {
    expect(service.getDotColor('auth')).toBe('#4ade80');
    expect(service.getDotColor('expedientes')).toBe('#60a5fa');
    expect(service.getDotColor('documentos')).toBe('#fbbf24');
    expect(service.getDotColor('unknown')).toBe('#9ca3af');
  });

  it('getResourceLabel devuelve etiqueta legible', () => {
    const item = { id: 1, fecha: '', usuario: '', ip: '', accion: '', modulo: 'expedientes', recursoId: 5, detalle: '' };
    expect(service.getResourceLabel(item)).toBe('Expediente #5');
  });

  it('getResourceLabel devuelve vacío si no hay recursoId', () => {
    const item = { id: 1, fecha: '', usuario: '', ip: '', accion: '', modulo: 'auth', detalle: '' };
    expect(service.getResourceLabel(item)).toBe('');
  });
});
