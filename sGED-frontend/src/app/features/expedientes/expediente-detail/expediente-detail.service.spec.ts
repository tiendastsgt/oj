import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ExpedienteDetailService } from './expediente-detail.service';
import { ExpedientesService } from '../../../core/services/expedientes.service';
import { CatalogosService } from '../../../core/services/catalogos.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadState } from './expediente-detail.types';
import { AuthUser } from '../../../core/models/auth-user.model';
import { ApiResponse } from '../../../core/models/api-response.model';
import { ExpedienteResponse } from '../../../core/models/expediente.model';
import { TipoProceso, EstadoExpediente, Juzgado } from '../../../core/models/catalogos.model';
import { Documento } from '../../documentos/models/documento.model';

const mockAdmin: AuthUser = {
  username: 'admin',
  nombreCompleto: 'Administrador',
  rol: 'ADMINISTRADOR',
  debeCambiarPassword: false,
};

const mockSecretario: AuthUser = {
  username: 'jsec',
  nombreCompleto: 'Juan Secretario',
  rol: 'SECRETARIO',
  debeCambiarPassword: false,
};

const mockConsulta: AuthUser = {
  username: 'jcon',
  nombreCompleto: 'Juan Consulta',
  rol: 'CONSULTA',
  debeCambiarPassword: false,
};

const mockExpediente: ExpedienteResponse = {
  id: 1,
  numero: 'EXP-2026-001',
  tipoProcesoId: 2,
  juzgadoId: 3,
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

function buildService(
  routeParams: Record<string, string>,
  user: AuthUser,
  expedienteRes?: ApiResponse<ExpedienteResponse>,
  getExpedienteError?: unknown,
) {
  const expedientesSpy = jasmine.createSpyObj<ExpedientesService>(
    'ExpedientesService', ['getExpediente'],
  );
  const catalogosSpy = jasmine.createSpyObj<CatalogosService>(
    'CatalogosService', ['getTiposProceso', 'getEstadosExpediente', 'getJuzgados'],
  );
  const authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['getCurrentUser']);

  const defResponse: ApiResponse<ExpedienteResponse> = { success: true, data: mockExpediente };
  if (getExpedienteError) {
    expedientesSpy.getExpediente.and.returnValue(throwError(() => getExpedienteError));
  } else {
    expedientesSpy.getExpediente.and.returnValue(of(expedienteRes ?? defResponse));
  }

  catalogosSpy.getTiposProceso.and.returnValue(
    of({ success: true, data: [{ id: 2, nombre: 'Penal' }] as TipoProceso[] }),
  );
  catalogosSpy.getEstadosExpediente.and.returnValue(
    of({ success: true, data: [{ id: 1, nombre: 'Activo' }] as EstadoExpediente[] }),
  );
  catalogosSpy.getJuzgados.and.returnValue(
    of({ success: true, data: [{ id: 3, nombre: 'Juzgado 3ro' }] as Juzgado[] }),
  );
  authSpy.getCurrentUser.and.returnValue(user);

  TestBed.configureTestingModule({
    providers: [
      ExpedienteDetailService,
      { provide: ExpedientesService, useValue: expedientesSpy },
      { provide: CatalogosService,   useValue: catalogosSpy },
      { provide: AuthService,        useValue: authSpy },
      { provide: Router,             useValue: {} },
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: convertToParamMap(routeParams) } },
      },
    ],
  });

  return {
    service: TestBed.inject(ExpedienteDetailService),
    expedientesSpy,
    catalogosSpy,
  };
}

describe('ExpedienteDetailService', () => {

  // ─── Constructor ────────────────────────────────────────────────

  it('id inválido (0): dto en Error con mensaje', () => {
    const { service } = buildService({}, mockAdmin);
    expect(service.dto.state()).toBe(LoadState.Error);
    expect(service.dto.errorMessage()).toBe('Expediente inválido');
  });

  it('id válido: carga catálogos y expediente', () => {
    const { catalogosSpy, expedientesSpy } = buildService({ id: '1' }, mockAdmin);
    expect(catalogosSpy.getTiposProceso).toHaveBeenCalledTimes(1);
    expect(catalogosSpy.getEstadosExpediente).toHaveBeenCalledTimes(1);
    expect(catalogosSpy.getJuzgados).toHaveBeenCalledTimes(1);
    expect(expedientesSpy.getExpediente).toHaveBeenCalledWith(1);
  });

  it('carga exitosa: dto.expediente contiene el objeto, state es Success', () => {
    const { service } = buildService({ id: '1' }, mockAdmin);
    expect(service.dto.expediente()?.numero).toBe('EXP-2026-001');
    expect(service.dto.state()).toBe(LoadState.Success);
  });

  it('carga con data undefined: dto en Error con "Expediente no encontrado"', () => {
    const { service } = buildService({ id: '1' }, mockAdmin, { success: true, data: undefined });
    expect(service.dto.state()).toBe(LoadState.Error);
    expect(service.dto.errorMessage()).toBe('Expediente no encontrado');
  });

  it('error HTTP: dto en Error con mensaje del servidor', () => {
    const { service } = buildService(
      { id: '1' }, mockAdmin,
      undefined,
      { error: { message: 'Sin acceso' } },
    );
    expect(service.dto.state()).toBe(LoadState.Error);
    expect(service.dto.errorMessage()).toBe('Sin acceso');
  });

  it('catálogos se almacenan en el DTO', () => {
    const { service } = buildService({ id: '1' }, mockAdmin);
    expect(service.dto.tiposProceso()).toEqual([{ id: 2, nombre: 'Penal' }]);
    expect(service.dto.estados()).toEqual([{ id: 1, nombre: 'Activo' }]);
    expect(service.dto.juzgados()).toEqual([{ id: 3, nombre: 'Juzgado 3ro' }]);
  });

  // ─── canEdit ────────────────────────────────────────────────────

  it('canEdit es true para ADMINISTRADOR', () => {
    const { service } = buildService({ id: '1' }, mockAdmin);
    expect(service.canEdit()).toBeTrue();
  });

  it('canEdit es true para SECRETARIO', () => {
    const { service } = buildService({ id: '1' }, mockSecretario);
    expect(service.canEdit()).toBeTrue();
  });

  it('canEdit es false para CONSULTA', () => {
    const { service } = buildService({ id: '1' }, mockConsulta);
    expect(service.canEdit()).toBeFalse();
  });

  // ─── Lookup helpers ─────────────────────────────────────────────

  it('getTipoProcesoName retorna nombre si existe', () => {
    const { service } = buildService({ id: '1' }, mockAdmin);
    expect(service.getTipoProcesoName(2)).toBe('Penal');
  });

  it('getTipoProcesoName retorna id como string si no existe', () => {
    const { service } = buildService({ id: '1' }, mockAdmin);
    expect(service.getTipoProcesoName(99)).toBe('99');
  });

  it('getEstadoName retorna nombre si existe', () => {
    const { service } = buildService({ id: '1' }, mockAdmin);
    expect(service.getEstadoName(1)).toBe('Activo');
  });

  it('getJuzgadoName retorna nombre si existe', () => {
    const { service } = buildService({ id: '1' }, mockAdmin);
    expect(service.getJuzgadoName(3)).toBe('Juzgado 3ro');
  });

  it('getJuzgadoName retorna id como string si no existe', () => {
    const { service } = buildService({ id: '1' }, mockAdmin);
    expect(service.getJuzgadoName(99)).toBe('99');
  });

  // ─── Document viewer ────────────────────────────────────────────

  it('viewDocumento establece dto.selectedDocumento', () => {
    const { service } = buildService({ id: '1' }, mockAdmin);
    service.viewDocumento(mockDocumento);
    expect(service.dto.selectedDocumento()?.nombreOriginal).toBe('demanda.pdf');
  });

  it('closeViewer limpia dto.selectedDocumento', () => {
    const { service } = buildService({ id: '1' }, mockAdmin);
    service.viewDocumento(mockDocumento);
    service.closeViewer();
    expect(service.dto.selectedDocumento()).toBeNull();
  });

  it('setReadingMode actualiza dto.readingModeActive', () => {
    const { service } = buildService({ id: '1' }, mockAdmin);
    service.setReadingMode(true);
    expect(service.dto.readingModeActive()).toBeTrue();
    service.setReadingMode(false);
    expect(service.dto.readingModeActive()).toBeFalse();
  });
});
