import { UsuarioFormDto, ROLES_ESTATICOS } from './usuario-form.dto';
import { LoadState } from './usuario-form.types';

describe('UsuarioFormDto', () => {
  let dto: UsuarioFormDto;

  beforeEach(() => { dto = new UsuarioFormDto(); });

  it('inicia en modo creación', () => {
    expect(dto.isCreation()).toBe(true);
    expect(dto.usuarioId()).toBeNull();
  });

  it('estado inicial es Idle', () => {
    expect(dto.state()).toBe(LoadState.Idle);
    expect(dto.isLoading()).toBe(false);
  });

  it('submitting inicia en false', () => {
    expect(dto.submitting()).toBe(false);
  });

  it('juzgados inicia vacío', () => {
    expect(dto.juzgados()).toEqual([]);
  });

  it('roles tiene los 4 roles estáticos', () => {
    expect(dto.roles().length).toBe(4);
    expect(dto.roles()[0].label).toBe('ADMINISTRADOR');
    expect(dto.roles()[1].label).toBe('SECRETARIO');
    expect(dto.roles()[2].label).toBe('AUXILIAR');
    expect(dto.roles()[3].label).toBe('CONSULTA');
  });

  it('ROLES_ESTATICOS contiene los 4 roles con values 1-4', () => {
    expect(ROLES_ESTATICOS.length).toBe(4);
    expect(ROLES_ESTATICOS.map(r => r.value)).toEqual([1, 2, 3, 4]);
  });

  it('isLoading es true cuando state es Loading', () => {
    dto.state.set(LoadState.Loading);
    expect(dto.isLoading()).toBe(true);
  });

  it('isCreation.set cambia el modo', () => {
    dto.isCreation.set(false);
    expect(dto.isCreation()).toBe(false);
  });

  it('submitting.set activa el estado de envío', () => {
    dto.submitting.set(true);
    expect(dto.submitting()).toBe(true);
  });

  it('juzgados.set reemplaza la lista', () => {
    dto.juzgados.set([{ label: 'Juzgado Uno', value: 1 }]);
    expect(dto.juzgados().length).toBe(1);
    expect(dto.juzgados()[0].label).toBe('Juzgado Uno');
  });

  it('errorMessage.set almacena el mensaje', () => {
    dto.errorMessage.set('Error de validación');
    expect(dto.errorMessage()).toBe('Error de validación');
  });
});
