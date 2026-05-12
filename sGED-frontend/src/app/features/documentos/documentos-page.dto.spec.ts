import { DocumentosPageDto } from './documentos-page.dto';
import { LoadState, ViewerType } from './documentos-page.types';
import { Documento } from './models/documento.model';

const mockDoc: Documento = {
  id: 1,
  expedienteId: 10,
  nombreOriginal: 'contrato.pdf',
  tamanio: 1024,
  mimeType: 'application/pdf',
  extension: 'pdf',
  categoria: 'PDF',
  usuarioCreacion: 'admin',
  fechaCreacion: '2025-01-01',
};

describe('DocumentosPageDto', () => {
  let dto: DocumentosPageDto;

  beforeEach(() => { dto = new DocumentosPageDto(); });

  // ─── Estado inicial ───

  it('inicia en LoadState.Loading', () => {
    expect(dto.state()).toBe(LoadState.Loading);
    expect(dto.isLoading()).toBe(true);
    expect(dto.hasError()).toBe(false);
  });

  it('expedienteId inicia en 0 y documentos en lista vacía', () => {
    expect(dto.expedienteId()).toBe(0);
    expect(dto.documentos()).toEqual([]);
  });

  it('visor inicia cerrado', () => {
    expect(dto.viewerType()).toBeNull();
    expect(dto.viewerVisible()).toBe(false);
    expect(dto.selectedDocumento()).toBeNull();
    expect(dto.viewerUrl()).toBe('');
  });

  it('viewerTitle muestra texto por defecto cuando no hay documento', () => {
    expect(dto.viewerTitle()).toBe('Visor de Documentos');
  });

  // ─── Transiciones de estado ───

  it('isLoading es false cuando state pasa a Success', () => {
    dto.state.set(LoadState.Success);
    expect(dto.isLoading()).toBe(false);
    expect(dto.hasError()).toBe(false);
  });

  it('hasError es true cuando state pasa a Error', () => {
    dto.state.set(LoadState.Error);
    expect(dto.hasError()).toBe(true);
    expect(dto.isLoading()).toBe(false);
  });

  // ─── Mutaciones ───

  it('documentos.set reemplaza la lista', () => {
    dto.documentos.set([mockDoc]);
    expect(dto.documentos().length).toBe(1);
    expect(dto.documentos()[0].id).toBe(1);
  });

  it('viewerVisible se activa al asignar viewerType', () => {
    dto.viewerType.set('PDF');
    expect(dto.viewerVisible()).toBe(true);
  });

  it('viewerVisible se desactiva al poner viewerType en null', () => {
    dto.viewerType.set('IMAGEN');
    dto.viewerType.set(null);
    expect(dto.viewerVisible()).toBe(false);
  });

  it('viewerTitle muestra el nombre del documento seleccionado', () => {
    dto.selectedDocumento.set(mockDoc);
    expect(dto.viewerTitle()).toBe('contrato.pdf');
  });

  it('errorMessage.set almacena el mensaje', () => {
    expect(dto.errorMessage()).toBe('');
    dto.errorMessage.set('Error de conexión');
    expect(dto.errorMessage()).toBe('Error de conexión');
  });

  it('expedienteId.set actualiza el id', () => {
    dto.expedienteId.set(42);
    expect(dto.expedienteId()).toBe(42);
  });
});
