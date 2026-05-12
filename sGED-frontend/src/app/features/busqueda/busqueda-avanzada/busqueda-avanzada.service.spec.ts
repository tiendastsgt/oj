import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { RolUsuario } from '../../../core/models/auth-user.model';
import { BusquedaExpedientesService } from '../../../core/services/busqueda-expedientes.service';
import { CatalogosService } from '../../../core/services/catalogos.service';
import { BusquedaAvanzadaService } from './busqueda-avanzada.service';

describe('BusquedaAvanzadaService', () => {
  let service: BusquedaAvanzadaService;
  let busquedaSpy: jasmine.SpyObj<BusquedaExpedientesService>;
  let catalogosSpy: jasmine.SpyObj<CatalogosService>;
  let authSpy: jasmine.SpyObj<AuthService>;

  const setup = (rol: RolUsuario) => {
    busquedaSpy    = jasmine.createSpyObj('BusquedaExpedientesService', ['buscarAvanzada']);
    catalogosSpy   = jasmine.createSpyObj('CatalogosService', ['getTiposProceso', 'getEstadosExpediente', 'getJuzgados']);
    authSpy        = jasmine.createSpyObj('AuthService', ['getCurrentUser']);

    catalogosSpy.getTiposProceso.and.returnValue(of({ success: true, data: [] }));
    catalogosSpy.getEstadosExpediente.and.returnValue(of({ success: true, data: [] }));
    catalogosSpy.getJuzgados.and.returnValue(of({ success: true, data: [{ id: 1, nombre: 'Juzgado Primero' }] }));
    authSpy.getCurrentUser.and.returnValue({
      username: 'user', nombreCompleto: 'User', rol,
      juzgado: 'Juzgado Primero', debeCambiarPassword: false
    });

    TestBed.configureTestingModule({
      providers: [
        BusquedaAvanzadaService,
        { provide: BusquedaExpedientesService, useValue: busquedaSpy },
        { provide: CatalogosService, useValue: catalogosSpy },
        { provide: AuthService, useValue: authSpy }
      ]
    }).compileComponents();

    service = TestBed.inject(BusquedaAvanzadaService);
  };

  it('invalida el formulario cuando fechaDesde > fechaHasta', () => {
    setup('ADMINISTRADOR');
    service.form.patchValue({
      fechaDesde: new Date('2026-02-01'),
      fechaHasta: new Date('2026-01-01')
    });
    expect(service.form.invalid).toBeTrue();
  });

  it('deshabilita juzgado para usuario no administrador', () => {
    setup('SECRETARIO');
    expect(service.form.get('juzgadoId')?.disabled).toBeTrue();
    expect(service.form.get('juzgadoId')?.value).toBe(1);
  });

  it('muestra errores del backend en dto.errorMessages', () => {
    setup('ADMINISTRADOR');
    busquedaSpy.buscarAvanzada.and.returnValue(
      throwError(() => ({ error: { errors: ['Error de validación'] } }))
    );
    service.onSubmit();
    expect(service.dto.errorMessages()).toEqual(['Error de validación']);
  });

  it('acepta rango de fechas válido', () => {
    setup('ADMINISTRADOR');
    service.form.patchValue({
      fechaDesde: new Date('2026-01-01'),
      fechaHasta: new Date('2026-02-01')
    });
    expect(service.form.valid).toBeTrue();
  });
});
