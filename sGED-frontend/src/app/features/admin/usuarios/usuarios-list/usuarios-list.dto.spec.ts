import { UsuariosListDto } from './usuarios-list.dto';
import { LoadState, UsuarioAdminResponse } from './usuarios-list.types';

const mockUsuario: UsuarioAdminResponse = {
  id: 1, username: 'user1', nombreCompleto: 'Usuario Uno', email: 'u@test.com',
  rol: 'SECRETARIO', juzgado: 'Juzgado 1', activo: true, bloqueado: false,
  intentosFallidos: 0, debeCambiarPassword: false,
  fechaCreacion: '2026-01-01T00:00:00', fechaModificacion: '2026-01-01T00:00:00'
};

describe('UsuariosListDto', () => {
  let dto: UsuariosListDto;

  beforeEach(() => { dto = new UsuariosListDto(); });

  it('inicia en estado Idle', () => {
    expect(dto.state()).toBe(LoadState.Idle);
    expect(dto.isLoading()).toBe(false);
    expect(dto.hasError()).toBe(false);
  });

  it('inicia con lista vacía y contadores en 0', () => {
    expect(dto.usuarios()).toEqual([]);
    expect(dto.totalRecords()).toBe(0);
    expect(dto.currentPage()).toBe(0);
    expect(dto.pageSize()).toBe(20);
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

  it('isLoading y hasError son false en Success', () => {
    dto.state.set(LoadState.Success);
    expect(dto.isLoading()).toBe(false);
    expect(dto.hasError()).toBe(false);
  });

  it('usuarios.set reemplaza la lista', () => {
    dto.usuarios.set([mockUsuario]);
    expect(dto.usuarios().length).toBe(1);
    expect(dto.usuarios()[0].username).toBe('user1');
  });

  it('totalRecords.set actualiza el total', () => {
    dto.totalRecords.set(100);
    expect(dto.totalRecords()).toBe(100);
  });

  it('currentPage.set actualiza la página', () => {
    dto.currentPage.set(3);
    expect(dto.currentPage()).toBe(3);
  });

  it('errorMessage.set almacena el mensaje', () => {
    dto.errorMessage.set('Error de red');
    expect(dto.errorMessage()).toBe('Error de red');
  });
});
