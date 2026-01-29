import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UsuariosListComponent } from './usuarios-list.component';
import { AdminUsuariosService } from '../../../../core/services/admin-usuarios.service';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UsuarioAdminResponse } from '../../../../core/models/admin-usuarios.model';
import { of } from 'rxjs';

describe('UsuariosListComponent', () => {
  let component: UsuariosListComponent;
  let fixture: ComponentFixture<UsuariosListComponent>;
  let adminUsuariosService: AdminUsuariosService;
  let httpMock: HttpTestingController;
  let messageService: MessageService;

  const mockUsuarios: UsuarioAdminResponse[] = [
    {
      id: 1,
      username: 'user1',
      nombreCompleto: 'Usuario Uno',
      email: 'user1@test.com',
      rol: 'SECRETARIO',
      juzgado: 'Juzgado 1',
      activo: true,
      bloqueado: false,
      intentosFallidos: 0,
      debeCambiarPassword: false,
      fechaCreacion: '2026-01-20T10:00:00',
      fechaModificacion: '2026-01-20T10:00:00'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosListComponent, HttpClientTestingModule, BrowserAnimationsModule],
      providers: [AdminUsuariosService, MessageService, ConfirmationService]
    }).compileComponents();

    fixture = TestBed.createComponent(UsuariosListComponent);
    component = fixture.componentInstance;
    adminUsuariosService = TestBed.inject(AdminUsuariosService);
    httpMock = TestBed.inject(HttpTestingController);
    messageService = TestBed.inject(MessageService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar usuarios al inicializar', () => {
    const mockResponse = {
      data: {
        content: mockUsuarios,
        pageable: { totalElements: 1, pageNumber: 0, pageSize: 20, totalPages: 1 }
      }
    };
    spyOn(adminUsuariosService, 'getUsuarios').and.returnValue(of(mockResponse as any));

    component.ngOnInit();

    expect(component.usuarios.length).toBe(1);
    expect(component.totalRecords).toBe(1);
  });

  it('debe navegar a crear nuevo usuario', () => {
    spyOn(component['router'], 'navigate');
    component.crearNuevo();
    expect(component['router'].navigate).toHaveBeenCalledWith(['/admin/usuarios/nuevo']);
  });

  it('debe navegar a ver detalle del usuario', () => {
    spyOn(component['router'], 'navigate');
    component.verDetalle(1);
    expect(component['router'].navigate).toHaveBeenCalledWith(['/admin/usuarios', 1]);
  });

  it('debe navegar a editar usuario', () => {
    spyOn(component['router'], 'navigate');
    component.editar(1);
    expect(component['router'].navigate).toHaveBeenCalledWith(['/admin/usuarios', 1, 'editar']);
  });

  it('debe aplicar filtros y recargar usuarios', () => {
    spyOn(component, 'cargarUsuarios');
    component.filterForm.patchValue({ username: 'test' });
    component.aplicarFiltros();
    expect(component.cargarUsuarios).toHaveBeenCalledWith(0);
  });
});
