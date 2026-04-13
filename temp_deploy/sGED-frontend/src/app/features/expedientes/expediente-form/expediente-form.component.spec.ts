import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthUser } from '../../../core/models/auth-user.model';
import { ApiResponse } from '../../../core/models/api-response.model';
import { ExpedienteResponse } from '../../../core/models/expediente.model';
import { AuthService } from '../../../core/services/auth.service';
import { CatalogosService } from '../../../core/services/catalogos.service';
import { ExpedientesService } from '../../../core/services/expedientes.service';
import { ExpedienteFormComponent } from './expediente-form.component';

describe('ExpedienteFormComponent', () => {
  let component: ExpedienteFormComponent;
  let fixture: ComponentFixture<ExpedienteFormComponent>;
  let expedientesService: jasmine.SpyObj<ExpedientesService>;
  let catalogosService: jasmine.SpyObj<CatalogosService>;
  let authService: jasmine.SpyObj<AuthService>;

  const setup = (routeParams: Record<string, string>, expedienteResponse?: ApiResponse<ExpedienteResponse>) => {
    expedientesService = jasmine.createSpyObj('ExpedientesService', ['getExpediente', 'createExpediente', 'updateExpediente']);
    catalogosService = jasmine.createSpyObj('CatalogosService', ['getTiposProceso', 'getEstadosExpediente', 'getJuzgados']);
    authService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);

    catalogosService.getTiposProceso.and.returnValue(of({ success: true, data: [{ id: 1, nombre: 'Civil' }] }));
    catalogosService.getEstadosExpediente.and.returnValue(of({ success: true, data: [{ id: 1, nombre: 'Activo' }] }));
    catalogosService.getJuzgados.and.returnValue(of({ success: true, data: [{ id: 1, nombre: 'Juzgado Primero' }] }));
    authService.getCurrentUser.and.returnValue({
      username: 'admin',
      nombreCompleto: 'Admin',
      rol: 'ADMINISTRADOR',
      juzgado: 'Juzgado Primero',
      debeCambiarPassword: false
    } as AuthUser);

    if (expedienteResponse) {
      expedientesService.getExpediente.and.returnValue(of(expedienteResponse));
    }

    TestBed.configureTestingModule({
      imports: [ExpedienteFormComponent],
      providers: [
        { provide: ExpedientesService, useValue: expedientesService },
        { provide: CatalogosService, useValue: catalogosService },
        { provide: AuthService, useValue: authService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap(routeParams) }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExpedienteFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  it('should mark form invalid when required fields are empty', () => {
    setup({});
    component.form.patchValue({
      numero: '',
      tipoProcesoId: 0,
      juzgadoId: 0,
      estadoId: 0,
      fechaInicio: null as unknown as Date,
      descripcion: ''
    });
    expect(component.form.invalid).toBeTrue();
  });

  it('should disable numero in edit mode', () => {
    const expediente: ApiResponse<ExpedienteResponse> = {
      success: true,
      data: {
        id: 1,
        numero: 'EXP-1',
        tipoProcesoId: 1,
        juzgadoId: 1,
        estadoId: 1,
        fechaInicio: '2026-01-01',
        descripcion: 'Desc',
        usuarioCreacion: 'jperez',
        fechaCreacion: '2026-01-01T10:00:00'
      }
    };
    setup({ id: '1' }, expediente);

    expect(component.form.get('numero')?.disabled).toBeTrue();
  });

  it('should show backend errors[]', () => {
    setup({});
    expedientesService.createExpediente.and.returnValue(
      throwError(() => ({ error: { errors: ['El número ya existe'] } }))
    );
    component.form.patchValue({
      numero: 'EXP-1',
      tipoProcesoId: 1,
      juzgadoId: 1,
      estadoId: 1,
      fechaInicio: new Date(),
      descripcion: 'Desc'
    });
    component.onSubmit();
    expect(component.errorMessages).toEqual(['El número ya existe']);
  });

  it('should show backend message when errors[] missing', () => {
    setup({});
    expedientesService.createExpediente.and.returnValue(
      throwError(() => ({ error: { message: 'Error de validación' } }))
    );
    component.form.patchValue({
      numero: 'EXP-1',
      tipoProcesoId: 1,
      juzgadoId: 1,
      estadoId: 1,
      fechaInicio: new Date(),
      descripcion: 'Desc'
    });
    component.onSubmit();
    expect(component.errorMessages).toEqual(['Error de validación']);
  });
});
