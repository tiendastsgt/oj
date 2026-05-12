// ═══════════════════════════════════════════════════════════════
// expedientes-list.dto.spec.ts
// Test puro del DTO — sin TestBed, sin Angular, sin HTTP.
// ═══════════════════════════════════════════════════════════════

import { ExpedientesListDto } from './expedientes-list.dto';
import { LoadState } from './expedientes-list.types';
import { ExpedienteResponse } from '../../../core/models/expediente.model';

describe('ExpedientesListDto', () => {
  let dto: ExpedientesListDto;

  beforeEach(() => {
    dto = new ExpedientesListDto();
  });

  // ─── Estado inicial ───

  it('inicia con LoadState.Loading (spinner visible hasta que llega el backend)', () => {
    expect(dto.state()).toBe(LoadState.Loading);
    expect(dto.isLoading()).toBe(true);
    expect(dto.hasError()).toBe(false);
  });

  it('inicia con lista vacía y totalRecords en 0 (sin mocks visibles)', () => {
    expect(dto.expedientes()).toEqual([]);
    expect(dto.totalRecords()).toBe(0);
  });

  it('tiene paginación por defecto correcta', () => {
    const p = dto.pagination();
    expect(p.page).toBe(0);
    expect(p.rows).toBe(10);
    expect(p.first).toBe(0);
    expect(p.sortField).toBe('fechaCreacion');
    expect(p.sortDir).toBe('desc');
  });

  it('catálogos y usuario inician vacíos', () => {
    expect(dto.tiposProceso()).toEqual([]);
    expect(dto.juzgados()).toEqual([]);
    expect(dto.currentUser()).toBeNull();
  });

  // ─── Transiciones de estado ───

  it('isLoading es false cuando state cambia a Success', () => {
    dto.state.set(LoadState.Success);
    expect(dto.isLoading()).toBe(false);
    expect(dto.hasError()).toBe(false);
  });

  it('hasError es true cuando state cambia a Error', () => {
    dto.state.set(LoadState.Error);
    expect(dto.hasError()).toBe(true);
    expect(dto.isLoading()).toBe(false);
  });

  // ─── Mutaciones de signals ───

  it('expedientes.set reemplaza la lista completa', () => {
    const nuevos: ExpedienteResponse[] = [
      {
        id: 99,
        numero: 'EXP-TEST-001',
        tipoProcesoId: 1,
        juzgadoId: 1,
        estadoId: 1,
        fechaInicio: '2025-01-01',
        descripcion: 'Test',
        usuarioCreacion: 'admin',
        fechaCreacion: '2025-01-01',
      },
    ];
    dto.expedientes.set(nuevos);
    expect(dto.expedientes()).toEqual(nuevos);
    expect(dto.expedientes().length).toBe(1);
  });

  it('totalRecords.set actualiza el conteo', () => {
    dto.totalRecords.set(42);
    expect(dto.totalRecords()).toBe(42);
  });

  it('error.set almacena el mensaje de error', () => {
    expect(dto.error()).toBeNull();
    dto.error.set('Error de conexión');
    expect(dto.error()).toBe('Error de conexión');
  });

  it('filters.update aplica cambios parciales', () => {
    dto.filters.update(f => ({ ...f, search: 'EXP-2025' }));
    expect(dto.filters().search).toBe('EXP-2025');
    expect(dto.filters().estadoId).toBeNull();
  });
});
