import { signal } from '@angular/core';
import { ResultadosBusquedaDto } from './resultados-busqueda.dto';
import { ExpedienteBusquedaResponse, Page } from './resultados-busqueda.types';

const makePage = (overrides: Partial<Page<ExpedienteBusquedaResponse>> = {}): Page<ExpedienteBusquedaResponse> => ({
  content: [], page: 0, size: 10, totalElements: 0, totalPages: 1, ...overrides
});

describe('ResultadosBusquedaDto', () => {
  it('totalRecords es 0 sin datos', () => {
    const dto = new ResultadosBusquedaDto(signal(undefined));
    expect(dto.totalRecords()).toBe(0);
  });

  it('rows es 10 sin datos', () => {
    const dto = new ResultadosBusquedaDto(signal(undefined));
    expect(dto.rows()).toBe(10);
  });

  it('first es 0 sin datos', () => {
    const dto = new ResultadosBusquedaDto(signal(undefined));
    expect(dto.first()).toBe(0);
  });

  it('totalRecords refleja totalElements del page', () => {
    const src = signal(makePage({ totalElements: 42 }));
    const dto = new ResultadosBusquedaDto(src);
    expect(dto.totalRecords()).toBe(42);
  });

  it('rows refleja size del page', () => {
    const src = signal(makePage({ size: 25 }));
    const dto = new ResultadosBusquedaDto(src);
    expect(dto.rows()).toBe(25);
  });

  it('first calcula correctamente el offset', () => {
    const src = signal(makePage({ page: 2, size: 10 }));
    const dto = new ResultadosBusquedaDto(src);
    expect(dto.first()).toBe(20);
  });

  it('actualiza totalRecords cuando cambia el signal', () => {
    const src = signal<Page<ExpedienteBusquedaResponse> | undefined>(undefined);
    const dto = new ResultadosBusquedaDto(src);
    expect(dto.totalRecords()).toBe(0);
    src.set(makePage({ totalElements: 7 }));
    expect(dto.totalRecords()).toBe(7);
  });

  it('actualiza first cuando cambia la página', () => {
    const src = signal(makePage({ page: 0, size: 10 }));
    const dto = new ResultadosBusquedaDto(src);
    expect(dto.first()).toBe(0);
    src.set(makePage({ page: 3, size: 10 }));
    expect(dto.first()).toBe(30);
  });
});
