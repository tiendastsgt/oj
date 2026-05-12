import { UsuarioDetailDto } from './usuario-detail.dto';
import { LoadState, UsuarioAdminResponse } from './usuario-detail.types';

const mockUsuario: UsuarioAdminResponse = {
  id: 1, username: 'jperez', nombreCompleto: 'Juan Pérez García',
  email: 'j@test.com', rol: 'SECRETARIO', juzgado: 'Juzgado 1',
  activo: true, bloqueado: false, intentosFallidos: 0,
  debeCambiarPassword: false, fechaCreacion: '2026-01-01', fechaModificacion: '2026-01-01'
};

describe('UsuarioDetailDto', () => {
  let dto: UsuarioDetailDto;

  beforeEach(() => { dto = new UsuarioDetailDto(); });

  it('inicia en LoadState.Loading', () => {
    expect(dto.state()).toBe(LoadState.Loading);
    expect(dto.isLoading()).toBe(true);
    expect(dto.hasError()).toBe(false);
  });

  it('usuario y usuarioId inician como null', () => {
    expect(dto.usuario()).toBeNull();
    expect(dto.usuarioId()).toBeNull();
  });

  it('initials devuelve ? cuando no hay usuario', () => {
    expect(dto.initials()).toBe('?');
  });

  it('initials usa primeras letras de nombre y apellido', () => {
    dto.usuario.set(mockUsuario);
    expect(dto.initials()).toBe('JP');
  });

  it('initials usa 2 primeras letras si el nombre es una palabra', () => {
    dto.usuario.set({ ...mockUsuario, nombreCompleto: 'Mononymous' });
    expect(dto.initials()).toBe('MO');
  });

  it('initials devuelve ? si nombreCompleto está vacío', () => {
    dto.usuario.set({ ...mockUsuario, nombreCompleto: '' });
    expect(dto.initials()).toBe('?');
  });

  it('hasError es true cuando state es Error', () => {
    dto.state.set(LoadState.Error);
    expect(dto.hasError()).toBe(true);
    expect(dto.isLoading()).toBe(false);
  });

  it('isLoading es false cuando state es Success', () => {
    dto.state.set(LoadState.Success);
    expect(dto.isLoading()).toBe(false);
    expect(dto.hasError()).toBe(false);
  });

  it('usuario.set actualiza el usuario', () => {
    dto.usuario.set(mockUsuario);
    expect(dto.usuario()?.username).toBe('jperez');
  });

  it('errorMessage.set almacena el mensaje', () => {
    dto.errorMessage.set('Error al cargar');
    expect(dto.errorMessage()).toBe('Error al cargar');
  });

  it('usuarioId.set actualiza el id', () => {
    dto.usuarioId.set(42);
    expect(dto.usuarioId()).toBe(42);
  });
});
