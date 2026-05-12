import { ExpedienteFormDto } from './expediente-form.dto';
import { LoadState } from './expediente-form.types';

describe('ExpedienteFormDto', () => {
  let dto: ExpedienteFormDto;

  beforeEach(() => { dto = new ExpedienteFormDto(); });

  it('inicia en Idle (formulario aún no enviado)', () => {
    expect(dto.state()).toBe(LoadState.Idle);
    expect(dto.isLoading()).toBe(false);
  });

  it('isLoading es true sólo en estado Loading', () => {
    dto.state.set(LoadState.Loading);
    expect(dto.isLoading()).toBe(true);
    dto.state.set(LoadState.Success);
    expect(dto.isLoading()).toBe(false);
  });

  it('inicia en modo create', () => {
    expect(dto.mode()).toBe('create');
    expect(dto.isEditMode()).toBe(false);
  });

  it('isEditMode es true cuando se cambia a edit', () => {
    dto.mode.set('edit');
    expect(dto.isEditMode()).toBe(true);
  });

  it('errors inicia vacío y acepta array de strings', () => {
    expect(dto.errors()).toEqual([]);
    dto.errors.set(['Error A', 'Error B']);
    expect(dto.errors()).toEqual(['Error A', 'Error B']);
  });

  it('successMessage inicia vacío y acepta string', () => {
    expect(dto.successMessage()).toBe('');
    dto.successMessage.set('Guardado');
    expect(dto.successMessage()).toBe('Guardado');
  });

  it('catálogos inician vacíos', () => {
    expect(dto.tiposProceso()).toEqual([]);
    expect(dto.estados()).toEqual([]);
    expect(dto.juzgados()).toEqual([]);
  });

  it('tiposProceso.set reemplaza la lista', () => {
    dto.tiposProceso.set([{ id: 1, nombre: 'Civil' }]);
    expect(dto.tiposProceso().length).toBe(1);
    expect(dto.tiposProceso()[0].nombre).toBe('Civil');
  });
});
