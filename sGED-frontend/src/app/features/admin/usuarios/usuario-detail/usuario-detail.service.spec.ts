import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

import { UsuarioDetailService } from './usuario-detail.service';
import { AdminUsuariosService } from '../../../../core/services/admin-usuarios.service';
import { LoadState } from './usuario-detail.types';

const mockUsuario = {
  id: 5, username: 'jperez', nombreCompleto: 'Juan Pérez',
  email: 'j@test.com', rol: 'SECRETARIO', juzgado: 'Juzgado 1',
  activo: true, bloqueado: false, intentosFallidos: 0,
  debeCambiarPassword: false, fechaCreacion: '2026-01-01', fechaModificacion: '2026-01-01'
};

describe('UsuarioDetailService', () => {
  let service: UsuarioDetailService;
  let adminSpy: jasmine.SpyObj<AdminUsuariosService>;
  let routerSpy: jasmine.SpyObj<Router>;

  function setup(routeId: string | null = null) {
    adminSpy = jasmine.createSpyObj('AdminUsuariosService', ['getUsuario']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    if (routeId) {
      adminSpy.getUsuario.and.returnValue(of({ success: true, data: mockUsuario } as any));
    }

    TestBed.configureTestingModule({
      providers: [
        UsuarioDetailService,
        MessageService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AdminUsuariosService, useValue: adminSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: { params: of(routeId ? { id: routeId } : {}) } }
      ]
    });

    service = TestBed.inject(UsuarioDetailService);
  }

  it('carga el usuario al iniciar con id válido', () => {
    setup('5');
    expect(adminSpy.getUsuario).toHaveBeenCalledWith(5);
    expect(service.dto.usuario()?.username).toBe('jperez');
    expect(service.dto.state()).toBe(LoadState.Success);
    expect(service.dto.usuarioId()).toBe(5);
  });

  it('no llama a getUsuario si no hay id en la ruta', () => {
    setup(null);
    expect(adminSpy.getUsuario).not.toHaveBeenCalled();
  });

  it('pone state en Error si la carga falla', () => {
    adminSpy = jasmine.createSpyObj('AdminUsuariosService', ['getUsuario']);
    adminSpy.getUsuario.and.returnValue(throwError(() => ({ error: { message: 'Sin conexión' } })));
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        UsuarioDetailService, MessageService,
        provideHttpClient(), provideHttpClientTesting(),
        { provide: AdminUsuariosService, useValue: adminSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: { params: of({ id: '5' }) } }
      ]
    });
    service = TestBed.inject(UsuarioDetailService);

    expect(service.dto.state()).toBe(LoadState.Error);
    expect(service.dto.errorMessage()).toBe('Sin conexión');
  });

  it('editar navega a la edición del usuario', () => {
    setup('5');
    service.editar();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/usuarios', 5, 'editar']);
  });

  it('volver navega al listado de usuarios', () => {
    setup('5');
    service.volver();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/usuarios']);
  });

  it('editar no navega si no hay usuarioId', () => {
    setup(null);
    service.editar();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});
