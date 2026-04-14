import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { AuthUser } from '../../../core/models/auth-user.model';
import { ApiResponse } from '../../../core/models/api-response.model';
import { ExpedienteResponse } from '../../../core/models/expediente.model';
import { Page } from '../../../core/models/page.model';
import { AuthService } from '../../../core/services/auth.service';
import { ExpedientesService } from '../../../core/services/expedientes.service';
import { CatalogosService } from '../../../core/services/catalogos.service';
import { ExpedientesListComponent } from './expedientes-list.component';

describe('ExpedientesListComponent', () => {
  let component: ExpedientesListComponent;
  let fixture: ComponentFixture<ExpedientesListComponent>;
  let expedientesService: jasmine.SpyObj<ExpedientesService>;
  let authService: jasmine.SpyObj<AuthService>;

  const buildResponse = (): ApiResponse<Page<ExpedienteResponse>> => ({
    success: true,
    data: {
      content: [
        {
          id: 1,
          numero: 'EXP-1',
          tipoProcesoId: 1,
          juzgadoId: 2,
          estadoId: 3,
          fechaInicio: '2026-01-01',
          descripcion: 'Desc',
          usuarioCreacion: 'jperez',
          fechaCreacion: '2026-01-01T10:00:00'
        }
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1
    }
  });

  let catalogosService: jasmine.SpyObj<CatalogosService>;

  beforeEach(async () => {
    expedientesService = jasmine.createSpyObj('ExpedientesService', ['getExpedientes']);
    authService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    catalogosService = jasmine.createSpyObj('CatalogosService', ['getTiposProceso', 'getJuzgados']);

    expedientesService.getExpedientes.and.returnValue(of(buildResponse()));
    authService.getCurrentUser.and.returnValue({
      username: 'admin',
      nombreCompleto: 'Admin',
      rol: 'ADMINISTRADOR',
      debeCambiarPassword: false
    } as AuthUser);
    catalogosService.getTiposProceso.and.returnValue(of({ success: true, data: [] }));
    catalogosService.getJuzgados.and.returnValue(of({ success: true, data: [] }));

    await TestBed.configureTestingModule({
      imports: [ExpedientesListComponent, RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: ExpedientesService, useValue: expedientesService },
        { provide: AuthService, useValue: authService },
        { provide: CatalogosService, useValue: catalogosService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExpedientesListComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges(); is intentionally removed so fakeAsync tests can trigger it properly in their own zone
  });

  it('should render table rows with data', fakeAsync(() => {
    fixture.detectChanges(); // triggers ngOnInit inside fakeAsync
    tick(); // advance setTimeout
    fixture.detectChanges(); // update view after data sets
    expect(component.expedientes.length).toBe(1);
    expect(component.expedientes[0].numero).toBe('EXP-1');
  }));

  it('should call getExpedientes with pagination and sort', () => {
    component.onLazyLoad({ first: 10, rows: 10, sortField: 'numero', sortOrder: 1 });
    expect(expedientesService.getExpedientes).toHaveBeenCalledWith({
      page: 1,
      size: 10,
      sort: 'numero,asc'
    });
  });

  it('should hide edit button for AUXILIAR', fakeAsync(() => {
    fixture.detectChanges(); // init
    tick();
    authService.getCurrentUser.and.returnValue({
      username: 'aux',
      nombreCompleto: 'Aux',
      rol: 'AUXILIAR',
      debeCambiarPassword: false
    } as AuthUser);
    fixture = TestBed.createComponent(ExpedientesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const hasEdit = buttons.some((btn) => btn.nativeElement.textContent.includes('Editar'));
    expect(hasEdit).toBeFalse();
  }));
});
