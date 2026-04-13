import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { RolUsuario } from '../../../core/models/auth-user.model';
import { BusquedaExpedientesService } from '../../../core/services/busqueda-expedientes.service';
import { CatalogosService } from '../../../core/services/catalogos.service';
import { BusquedaAvanzadaComponent } from './busqueda-avanzada.component';

describe('BusquedaAvanzadaComponent', () => {
  let component: BusquedaAvanzadaComponent;
  let fixture: ComponentFixture<BusquedaAvanzadaComponent>;
  let busquedaService: jasmine.SpyObj<BusquedaExpedientesService>;
  let catalogosService: jasmine.SpyObj<CatalogosService>;
  let authService: jasmine.SpyObj<AuthService>;

  const setup = (rol: RolUsuario) => {
    busquedaService = jasmine.createSpyObj('BusquedaExpedientesService', ['buscarAvanzada']);
    catalogosService = jasmine.createSpyObj('CatalogosService', ['getTiposProceso', 'getEstadosExpediente', 'getJuzgados']);
    authService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);

    catalogosService.getTiposProceso.and.returnValue(of({ success: true, data: [] }));
    catalogosService.getEstadosExpediente.and.returnValue(of({ success: true, data: [] }));
    catalogosService.getJuzgados.and.returnValue(of({ success: true, data: [{ id: 1, nombre: 'Juzgado Primero' }] }));
    authService.getCurrentUser.and.returnValue({
      username: 'user',
      nombreCompleto: 'User',
      rol,
      juzgado: 'Juzgado Primero',
      debeCambiarPassword: false
    });

    TestBed.configureTestingModule({
      imports: [BusquedaAvanzadaComponent],
      providers: [
        { provide: BusquedaExpedientesService, useValue: busquedaService },
        { provide: CatalogosService, useValue: catalogosService },
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BusquedaAvanzadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  it('should invalidate when fechaDesde > fechaHasta', () => {
    setup('ADMINISTRADOR');
    component.form.patchValue({
      fechaDesde: new Date('2026-02-01'),
      fechaHasta: new Date('2026-01-01')
    });
    expect(component.form.invalid).toBeTrue();
  });

  it('should disable juzgado for non-admin', () => {
    setup('SECRETARIO');
    expect(component.form.get('juzgadoId')?.disabled).toBeTrue();
    expect(component.form.get('juzgadoId')?.value).toBe(1);
  });

  it('should show errors from backend', () => {
    setup('ADMINISTRADOR');
    busquedaService.buscarAvanzada.and.returnValue(
      throwError(() => ({ error: { errors: ['Error de validación'] } }))
    );
    component.onSubmit();
    expect(component.errorMessages).toEqual(['Error de validación']);
  });
});
