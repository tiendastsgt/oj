import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';

import { UsuariosListService } from './usuarios-list.service';
import { AdminUsuariosService } from '../../../../core/services/admin-usuarios.service';
import { LoadState } from './usuarios-list.types';

const mockPageResponse: any = {
  data: {
    content: [
      { id: 1, username: 'user1', nombreCompleto: 'Usuario Uno', email: 'u@test.com',
        rol: 'SECRETARIO', juzgado: 'Juzgado 1', activo: true, bloqueado: false,
        intentosFallidos: 0, debeCambiarPassword: false,
        fechaCreacion: '2026-01-01', fechaModificacion: '2026-01-01' }
    ],
    pageable: { totalElements: 1, pageNumber: 0, pageSize: 20, totalPages: 1 }
  }
};

describe('UsuariosListService', () => {
  let service: UsuariosListService;
  let adminSpy: jasmine.SpyObj<AdminUsuariosService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    adminSpy = jasmine.createSpyObj('AdminUsuariosService', [
      'getUsuarios', 'resetPassword', 'bloquearUsuario', 'desbloquearUsuario'
    ]);
    adminSpy.getUsuarios.and.returnValue(of(mockPageResponse));
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        UsuariosListService,
        MessageService,
        ConfirmationService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AdminUsuariosService, useValue: adminSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(UsuariosListService);
  });

  it('carga usuarios en el constructor y pone state en Success', () => {
    expect(adminSpy.getUsuarios).toHaveBeenCalledTimes(1);
    expect(service.dto.usuarios().length).toBe(1);
    expect(service.dto.state()).toBe(LoadState.Success);
    expect(service.dto.totalRecords()).toBe(1);
  });

  it('cargarUsuarios pone state en Error ante fallo', () => {
    adminSpy.getUsuarios.and.returnValue(throwError(() => ({ error: { message: 'Error de red' } })));
    service.cargarUsuarios();
    expect(service.dto.state()).toBe(LoadState.Error);
  });

  it('onLazyLoad calcula la página correctamente', () => {
    spyOn(service, 'cargarUsuarios');
    service.onLazyLoad({ first: 40, rows: 20 });
    expect(service.cargarUsuarios).toHaveBeenCalledWith(2);
  });

  it('onLazyLoad usa página 0 cuando first es 0', () => {
    spyOn(service, 'cargarUsuarios');
    service.onLazyLoad({ first: 0, rows: 20 });
    expect(service.cargarUsuarios).toHaveBeenCalledWith(0);
  });

  it('aplicarFiltros carga desde página 0', () => {
    spyOn(service, 'cargarUsuarios');
    service.aplicarFiltros();
    expect(service.cargarUsuarios).toHaveBeenCalledWith(0);
  });

  it('crearNuevo navega a /admin/usuarios/nuevo', () => {
    service.crearNuevo();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/usuarios/nuevo']);
  });

  it('verDetalle navega al detalle del usuario', () => {
    service.verDetalle(5);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/usuarios', 5]);
  });

  it('editar navega a la edición del usuario', () => {
    service.editar(5);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/usuarios', 5, 'editar']);
  });

  it('filterForm tiene controles username, activo y bloqueado', () => {
    expect(service.filterForm.get('username')).toBeTruthy();
    expect(service.filterForm.get('activo')).toBeTruthy();
    expect(service.filterForm.get('bloqueado')).toBeTruthy();
  });

  it('cargarUsuarios envía filtros del formulario', () => {
    adminSpy.getUsuarios.and.returnValue(of(mockPageResponse));
    service.filterForm.patchValue({ username: 'juan', activo: 'true' });
    service.cargarUsuarios(0);
    const args = adminSpy.getUsuarios.calls.mostRecent().args[0];
    expect(args?.username).toBe('juan');
    expect(args?.activo).toBe(true);
  });
});
