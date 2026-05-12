import { AuditoriaListDto } from './auditoria-list.dto';
import { AuditoriaResponse, LoadState } from './auditoria-list.types';

const mockItem: AuditoriaResponse = {
  id: 1, fecha: '2026-01-20T10:00:00', usuario: 'admin',
  ip: '127.0.0.1', accion: 'LOGIN', modulo: 'auth', detalle: 'ok'
};

describe('AuditoriaListDto', () => {
  let dto: AuditoriaListDto;

  beforeEach(() => { dto = new AuditoriaListDto(); });

  it('inicia en estado Idle', () => {
    expect(dto.state()).toBe(LoadState.Idle);
    expect(dto.isLoading()).toBe(false);
    expect(dto.hasError()).toBe(false);
  });

  it('inicia con lista vacía y contadores en cero', () => {
    expect(dto.auditoria()).toEqual([]);
    expect(dto.totalRecords()).toBe(0);
    expect(dto.currentPage()).toBe(0);
    expect(dto.pageSize()).toBe(50);
  });

  it('isLoading es true cuando state es Loading', () => {
    dto.state.set(LoadState.Loading);
    expect(dto.isLoading()).toBe(true);
    expect(dto.hasError()).toBe(false);
  });

  it('hasError es true cuando state es Error', () => {
    dto.state.set(LoadState.Error);
    expect(dto.hasError()).toBe(true);
    expect(dto.isLoading()).toBe(false);
  });

  it('auditoria.set reemplaza la lista', () => {
    dto.auditoria.set([mockItem]);
    expect(dto.auditoria().length).toBe(1);
    expect(dto.auditoria()[0].usuario).toBe('admin');
  });

  it('totalRecords.set actualiza el total', () => {
    dto.totalRecords.set(200);
    expect(dto.totalRecords()).toBe(200);
  });

  it('currentPage.set actualiza la página', () => {
    dto.currentPage.set(3);
    expect(dto.currentPage()).toBe(3);
  });

  it('errorMessage.set almacena el mensaje', () => {
    dto.errorMessage.set('Error de red');
    expect(dto.errorMessage()).toBe('Error de red');
  });

  it('now inicia como fecha reciente', () => {
    expect(dto.now()).toBeInstanceOf(Date);
  });
});
