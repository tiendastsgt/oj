import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ExpedienteFormService } from './expediente-form.service';
import { ExpedientesService } from '../../../core/services/expedientes.service';
import { CatalogosService } from '../../../core/services/catalogos.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadState } from './expediente-form.types';
import { AuthUser } from '../../../core/models/auth-user.model';
import { ApiResponse } from '../../../core/models/api-response.model';
import { ExpedienteResponse } from '../../../core/models/expediente.model';
import { TipoProceso, EstadoExpediente, Juzgado } from '../../../core/models/catalogos.model';

const mockAdmin: AuthUser = {
  username: 'admin',
  nombreCompleto: 'Administrador',
  rol: 'ADMINISTRADOR',
  debeCambiarPassword: false,
};

const mockSecretario: AuthUser = {
  username: 'jsecretario',
  nombreCompleto: 'Juan Secretario',
  rol: 'SECRETARIO',
  juzgado: 'Juzgado Primero',
  debeCambiarPassword: false,
};

const mockExpediente: ExpedienteResponse = {
  id: 1,
  numero: 'EXP-2026-001',
  tipoProcesoId: 1,
  juzgadoId: 1,
  estadoId: 1,
  fechaInicio: '2026-01-15',
  descripcion: 'Descripción test',
  usuarioCreacion: 'admin',
  fechaCreacion: '2026-01-15T10:00:00',
};

const mockTipos: TipoProceso[]        = [{ id: 1, nombre: 'Civil' }];
const mockEstados: EstadoExpediente[] = [{ id: 1, nombre: 'Activo' }];
const mockJuzgados: Juzgado[]        = [{ id: 1, nombre: 'Juzgado Primero' }];

function buildService(
  routeParams: Record<string, string>,
  user: AuthUser,
  expedienteRes?: ApiResponse<ExpedienteResponse>,
  createRes?: ApiResponse<ExpedienteResponse>,
  updateRes?: ApiResponse<ExpedienteResponse>,
  getExpedienteError?: unknown,
) {
  const expedientesSpy = jasmine.createSpyObj<ExpedientesService>(
    'ExpedientesService',
    ['getExpediente', 'createExpediente', 'updateExpediente'],
  );
  const catalogosSpy = jasmine.createSpyObj<CatalogosService>(
    'CatalogosService',
    ['getTiposProceso', 'getEstadosExpediente', 'getJuzgados'],
  );
  const authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['getCurrentUser']);

  catalogosSpy.getTiposProceso.and.returnValue(of({ success: true, data: mockTipos }));
  catalogosSpy.getEstadosExpediente.and.returnValue(of({ success: true, data: mockEstados }));
  catalogosSpy.getJuzgados.and.returnValue(of({ success: true, data: mockJuzgados }));
  authSpy.getCurrentUser.and.returnValue(user);

  if (getExpedienteError) {
    expedientesSpy.getExpediente.and.returnValue(throwError(() => getExpedienteError));
  } else if (expedienteRes) {
    expedientesSpy.getExpediente.and.returnValue(of(expedienteRes));
  }
  if (createRes) {
    expedientesSpy.createExpediente.and.returnValue(of(createRes));
  }
  if (updateRes) {
    expedientesSpy.updateExpediente.and.returnValue(of(updateRes));
  }

  const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

  TestBed.configureTestingModule({
    providers: [
      ExpedienteFormService,
      { provide: ExpedientesService, useValue: expedientesSpy },
      { provide: CatalogosService,   useValue: catalogosSpy },
      { provide: AuthService,        useValue: authSpy },
      { provide: Router,             useValue: routerSpy },
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: convertToParamMap(routeParams) } },
      },
    ],
  });

  return {
    service: TestBed.inject(ExpedienteFormService),
    expedientesSpy,
    catalogosSpy,
    routerSpy,
  };
}

describe('ExpedienteFormService', () => {

  // ─── Constructor / modo create ─────────────────────────────────

  it('en modo create: dto.mode es create y form.numero está habilitado', () => {
    const { service } = buildService({}, mockAdmin);
    expect(service.dto.mode()).toBe('create');
    expect(service.form.get('numero')?.disabled).toBeFalse();
  });

  it('en modo create: carga catálogos al construirse', () => {
    const { catalogosSpy } = buildService({}, mockAdmin);
    expect(catalogosSpy.getTiposProceso).toHaveBeenCalledTimes(1);
    expect(catalogosSpy.getEstadosExpediente).toHaveBeenCalledTimes(1);
    expect(catalogosSpy.getJuzgados).toHaveBeenCalledTimes(1);
  });

  it('catálogos se almacenan en el DTO', () => {
    const { service } = buildService({}, mockAdmin);
    expect(service.dto.tiposProceso()).toEqual(mockTipos);
    expect(service.dto.estados()).toEqual(mockEstados);
    expect(service.dto.juzgados()).toEqual(mockJuzgados);
  });

  // ─── Constructor / modo edit ────────────────────────────────────

  it('en modo edit: dto.mode es edit y form.numero está deshabilitado', () => {
    const expedienteRes: ApiResponse<ExpedienteResponse> = { success: true, data: mockExpediente };
    const { service } = buildService({ id: '1' }, mockAdmin, expedienteRes);
    expect(service.dto.mode()).toBe('edit');
    expect(service.form.get('numero')?.disabled).toBeTrue();
  });

  it('en modo edit: el formulario se rellena con los datos del expediente', () => {
    const expedienteRes: ApiResponse<ExpedienteResponse> = { success: true, data: mockExpediente };
    const { service } = buildService({ id: '1' }, mockAdmin, expedienteRes);
    expect(service.form.getRawValue().numero).toBe('EXP-2026-001');
    expect(service.form.getRawValue().descripcion).toBe('Descripción test');
  });

  it('en modo edit: un error HTTP deja el DTO en Error', () => {
    const { service } = buildService(
      { id: '1' }, mockAdmin,
      undefined, undefined, undefined,
      { error: { message: 'No encontrado' } },
    );
    expect(service.dto.errors()).toContain('No encontrado');
  });

  // ─── isAdmin / isInvalid ────────────────────────────────────────

  it('isAdmin retorna true para rol ADMINISTRADOR', () => {
    const { service } = buildService({}, mockAdmin);
    expect(service.isAdmin()).toBeTrue();
  });

  it('isAdmin retorna false para rol SECRETARIO', () => {
    const { service } = buildService({}, mockSecretario);
    expect(service.isAdmin()).toBeFalse();
  });

  it('isInvalid retorna false si campo no está touched', () => {
    const { service } = buildService({}, mockAdmin);
    expect(service.isInvalid('numero')).toBeFalse();
  });

  it('isInvalid retorna true si campo requerido está touched y vacío', () => {
    const { service } = buildService({}, mockAdmin);
    service.form.get('numero')?.markAsTouched();
    service.form.get('numero')?.setValue('');
    expect(service.isInvalid('numero')).toBeTrue();
  });

  // ─── submit ─────────────────────────────────────────────────────

  it('submit con formulario inválido llama markAllAsTouched, no llama al backend', () => {
    const { service, expedientesSpy } = buildService({}, mockAdmin);
    service.submit();
    expect(expedientesSpy.createExpediente).not.toHaveBeenCalled();
    expect(service.form.touched).toBeTrue();
  });

  it('submit exitoso en modo create navega al detalle del expediente', () => {
    const createResponse: ApiResponse<ExpedienteResponse> = {
      success: true,
      message: 'Expediente creado',
      data: { ...mockExpediente, id: 42 },
    };
    const { service, routerSpy } = buildService({}, mockAdmin, undefined, createResponse);
    service.form.patchValue({
      numero: 'EXP-001',
      tipoProcesoId: 1,
      juzgadoId: 1,
      estadoId: 1,
      fechaInicio: new Date('2026-01-15'),
      descripcion: 'Test',
    });
    service.submit();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/expedientes', 42]);
  });

  it('submit exitoso: dto.state es Success antes de navegar', () => {
    const createResponse: ApiResponse<ExpedienteResponse> = {
      success: true,
      data: { ...mockExpediente, id: 5 },
    };
    const { service } = buildService({}, mockAdmin, undefined, createResponse);
    service.form.patchValue({
      numero: 'EXP-001', tipoProcesoId: 1, juzgadoId: 1, estadoId: 1,
      fechaInicio: new Date(), descripcion: 'Test',
    });
    service.submit();
    expect(service.dto.state()).toBe(LoadState.Success);
  });

  it('submit error con errors[]: dto.errors contiene cada mensaje', () => {
    const { service, expedientesSpy } = buildService({}, mockAdmin);
    expedientesSpy.createExpediente.and.returnValue(
      throwError(() => ({ error: { errors: ['Número duplicado', 'Juzgado inválido'] } })),
    );
    service.form.patchValue({
      numero: 'EXP-001', tipoProcesoId: 1, juzgadoId: 1, estadoId: 1,
      fechaInicio: new Date(), descripcion: 'Test',
    });
    service.submit();
    expect(service.dto.errors()).toEqual(['Número duplicado', 'Juzgado inválido']);
    expect(service.dto.state()).toBe(LoadState.Error);
  });

  it('submit error con message: dto.errors contiene el mensaje', () => {
    const { service, expedientesSpy } = buildService({}, mockAdmin);
    expedientesSpy.createExpediente.and.returnValue(
      throwError(() => ({ error: { message: 'Error de validación' } })),
    );
    service.form.patchValue({
      numero: 'EXP-001', tipoProcesoId: 1, juzgadoId: 1, estadoId: 1,
      fechaInicio: new Date(), descripcion: 'Test',
    });
    service.submit();
    expect(service.dto.errors()).toEqual(['Error de validación']);
  });

  it('submit error sin payload conocido: dto.errors tiene mensaje genérico', () => {
    const { service, expedientesSpy } = buildService({}, mockAdmin);
    expedientesSpy.createExpediente.and.returnValue(throwError(() => ({})));
    service.form.patchValue({
      numero: 'EXP-001', tipoProcesoId: 1, juzgadoId: 1, estadoId: 1,
      fechaInicio: new Date(), descripcion: 'Test',
    });
    service.submit();
    expect(service.dto.errors()).toEqual(['No se pudo guardar el expediente']);
  });

  // ─── No-admin: juzgadoId bloqueado ──────────────────────────────

  it('no-admin: juzgadoId se establece y deshabilita al cargar juzgados', () => {
    const { service } = buildService({}, mockSecretario);
    expect(service.form.get('juzgadoId')?.value).toBe(1);
    expect(service.form.get('juzgadoId')?.disabled).toBeTrue();
  });

  it('no-admin con juzgado no encontrado: dto.errors informa el problema', () => {
    const secretarioSinJuzgado: AuthUser = { ...mockSecretario, juzgado: 'Juzgado Inexistente' };
    const { service } = buildService({}, secretarioSinJuzgado);
    // juzgadoId=1 para pasar min(1) y que el formulario sea válido;
    // resolveJuzgadoId() sigue siendo 0 porque 'Juzgado Inexistente' no está en el catálogo
    service.form.patchValue({
      numero: 'EXP-001', tipoProcesoId: 1, juzgadoId: 1, estadoId: 1,
      fechaInicio: new Date(), descripcion: 'Test',
    });
    service.submit();
    expect(service.dto.errors()).toEqual(['No se pudo determinar el juzgado del usuario']);
  });
});
