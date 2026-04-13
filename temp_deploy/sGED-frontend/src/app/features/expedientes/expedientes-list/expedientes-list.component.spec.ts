import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { AuthUser } from '../../../core/models/auth-user.model';
import { ApiResponse } from '../../../core/models/api-response.model';
import { ExpedienteResponse } from '../../../core/models/expediente.model';
import { Page } from '../../../core/models/page.model';
import { AuthService } from '../../../core/services/auth.service';
import { ExpedientesService } from '../../../core/services/expedientes.service';
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

  beforeEach(async () => {
    expedientesService = jasmine.createSpyObj('ExpedientesService', ['getExpedientes']);
    authService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    expedientesService.getExpedientes.and.returnValue(of(buildResponse()));
    authService.getCurrentUser.and.returnValue({
      username: 'admin',
      nombreCompleto: 'Admin',
      rol: 'ADMINISTRADOR',
      debeCambiarPassword: false
    } as AuthUser);

    await TestBed.configureTestingModule({
      imports: [ExpedientesListComponent, RouterTestingModule],
      providers: [
        { provide: ExpedientesService, useValue: expedientesService },
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExpedientesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render table rows with data', () => {
    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(1);
    expect(rows[0].nativeElement.textContent).toContain('EXP-1');
  });

  it('should call getExpedientes with pagination and sort', () => {
    component.onLazyLoad({ first: 10, rows: 10, sortField: 'numero', sortOrder: 1 });
    expect(expedientesService.getExpedientes).toHaveBeenCalledWith({
      page: 1,
      size: 10,
      sort: 'numero,asc'
    });
  });

  it('should hide edit button for AUXILIAR', () => {
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
  });
});
