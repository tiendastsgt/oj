import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { BusquedaExpedientesService } from '../../../core/services/busqueda-expedientes.service';
import { BusquedaRapidaComponent } from './busqueda-rapida.component';

describe('BusquedaRapidaComponent', () => {
  let component: BusquedaRapidaComponent;
  let fixture: ComponentFixture<BusquedaRapidaComponent>;
  let busquedaService: jasmine.SpyObj<BusquedaExpedientesService>;

  beforeEach(async () => {
    busquedaService = jasmine.createSpyObj('BusquedaExpedientesService', ['buscarRapida']);
    await TestBed.configureTestingModule({
      imports: [BusquedaRapidaComponent],
      providers: [{ provide: BusquedaExpedientesService, useValue: busquedaService }]
    }).compileComponents();

    fixture = TestBed.createComponent(BusquedaRapidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should require numero', () => {
    component.form.setValue({ numero: '' });
    component.onSubmit();
    expect(busquedaService.buscarRapida).not.toHaveBeenCalled();
  });

  it('should call buscarRapida with params', () => {
    busquedaService.buscarRapida.and.returnValue(of({ success: true, data: { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 } }));
    component.form.setValue({ numero: 'EXP-1' });
    component.onSubmit();
    expect(busquedaService.buscarRapida).toHaveBeenCalledWith('EXP-1', {
      page: 0,
      size: 10,
      sort: 'fechaUltimoMovimiento,desc'
    });
  });

  it('should show errors from backend', () => {
    busquedaService.buscarRapida.and.returnValue(
      throwError(() => ({ error: { errors: ['Numero inválido'] } }))
    );
    component.form.setValue({ numero: 'EXP-1' });
    component.onSubmit();
    expect(component.errorMessages).toEqual(['Numero inválido']);
  });
});
