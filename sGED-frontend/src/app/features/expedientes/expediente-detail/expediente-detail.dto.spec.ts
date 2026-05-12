import { ExpedienteDetailDto } from './expediente-detail.dto';
import { LoadState } from './expediente-detail.types';
import { ExpedienteResponse } from '../../../core/models/expediente.model';
import { Documento } from '../../documentos/models/documento.model';

const mockExpediente: ExpedienteResponse = {
  id: 1,
  numero: 'EXP-2026-001',
  tipoProcesoId: 1,
  juzgadoId: 1,
  estadoId: 1,
  fechaInicio: '2026-01-15',
  descripcion: 'Test',
  usuarioCreacion: 'admin',
  fechaCreacion: '2026-01-15T10:00:00',
};

const mockDocumento: Documento = {
  id: 10,
  expedienteId: 1,
  nombreOriginal: 'demanda.pdf',
  categoria: 'Legal',
  tamanio: 1024,
  mimeType: 'application/pdf',
  extension: 'pdf',
  usuarioCreacion: 'admin',
  fechaCreacion: '2026-01-16T08:00:00',
};

describe('ExpedienteDetailDto', () => {
  let dto: ExpedienteDetailDto;

  beforeEach(() => { dto = new ExpedienteDetailDto(); });

  it('inicia en Loading (carga inmediata al navegar al detalle)', () => {
    expect(dto.state()).toBe(LoadState.Loading);
    expect(dto.isLoading()).toBe(true);
    expect(dto.hasError()).toBe(false);
  });

  it('isLoading false y hasError false en estado Success', () => {
    dto.state.set(LoadState.Success);
    expect(dto.isLoading()).toBe(false);
    expect(dto.hasError()).toBe(false);
  });

  it('hasError true en estado Error', () => {
    dto.state.set(LoadState.Error);
    expect(dto.hasError()).toBe(true);
    expect(dto.isLoading()).toBe(false);
  });

  it('expediente inicia null', () => {
    expect(dto.expediente()).toBeNull();
  });

  it('expediente.set almacena el objeto', () => {
    dto.expediente.set(mockExpediente);
    expect(dto.expediente()?.numero).toBe('EXP-2026-001');
  });

  it('errorMessage inicia vacío', () => {
    expect(dto.errorMessage()).toBe('');
  });

  it('catálogos inician vacíos', () => {
    expect(dto.tiposProceso()).toEqual([]);
    expect(dto.estados()).toEqual([]);
    expect(dto.juzgados()).toEqual([]);
  });

  it('selectedDocumento inicia null', () => {
    expect(dto.selectedDocumento()).toBeNull();
  });

  it('selectedDocumento.set almacena el documento', () => {
    dto.selectedDocumento.set(mockDocumento);
    expect(dto.selectedDocumento()?.nombreOriginal).toBe('demanda.pdf');
  });

  it('readingModeActive inicia false', () => {
    expect(dto.readingModeActive()).toBeFalse();
  });

  it('readingModeActive.set cambia a true', () => {
    dto.readingModeActive.set(true);
    expect(dto.readingModeActive()).toBeTrue();
  });
});
