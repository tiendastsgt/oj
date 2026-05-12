import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

import { UsuarioFormService } from './usuario-form.service';
import { AdminUsuariosService } from '../../../../core/services/admin-usuarios.service';
import { CatalogosService } from '../../../../core/services/catalogos.service';

describe('UsuarioFormService', () => {
  let service: UsuarioFormService;
  let adminSpy: jasmine.SpyObj<AdminUsuariosService>;
  let catalogosSpy: jasmine.SpyObj<CatalogosService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockRoute = { params: of({}) };

  beforeEach(() => {
    adminSpy = jasmine.createSpyObj('AdminUsuariosService', ['getUsuario', 'createUsuario', 'updateUsuario']);
    catalogosSpy = jasmine.createSpyObj('CatalogosService', ['getJuzgados']);
    catalogosSpy.getJuzgados.and.returnValue(of({ data: [{ id: 1, nombre: 'Juzgado Primero' }] } as any));
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        UsuarioFormService,
        MessageService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AdminUsuariosService, useValue: adminSpy },
        { provide: CatalogosService, useValue: catalogosSpy },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(UsuarioFormService);
  });

  it('inicia en modo creación', () => {
    expect(service.dto.isCreation()).toBe(true);
    expect(service.dto.usuarioId()).toBeNull();
  });

  it('carga juzgados en la inicialización', () => {
    expect(catalogosSpy.getJuzgados).toHaveBeenCalled();
    expect(service.dto.juzgados().length).toBe(1);
    expect(service.dto.juzgados()[0].label).toBe('Juzgado Primero');
  });

  it('usa juzgado fallback ante error de catalogos', () => {
    catalogosSpy.getJuzgados.and.returnValue(throwError(() => new Error('timeout')));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        UsuarioFormService, MessageService,
        provideHttpClient(), provideHttpClientTesting(),
        { provide: AdminUsuariosService, useValue: adminSpy },
        { provide: CatalogosService, useValue: catalogosSpy },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: Router, useValue: routerSpy }
      ]
    });
    service = TestBed.inject(UsuarioFormService);
    expect(service.dto.juzgados()[0].label).toBe('Juzgado Primero Civil');
  });

  it('form tiene todos los controles requeridos', () => {
    ['username', 'nombreCompleto', 'email', 'rolId', 'juzgadoId', 'activo', 'bloqueado'].forEach(ctrl => {
      expect(service.form.get(ctrl)).withContext(ctrl).toBeTruthy();
    });
  });

  it('username es requerido y debe tener mínimo 3 caracteres', () => {
    service.form.patchValue({ username: '' });
    expect(service.form.get('username')?.hasError('required')).toBe(true);
    service.form.patchValue({ username: 'ab' });
    expect(service.form.get('username')?.hasError('minlength')).toBe(true);
  });

  it('email debe ser válido', () => {
    service.form.patchValue({ email: 'not-an-email' });
    expect(service.form.get('email')?.hasError('email')).toBe(true);
  });

  it('rolId y juzgadoId son requeridos', () => {
    service.form.patchValue({ rolId: null, juzgadoId: null });
    expect(service.form.get('rolId')?.hasError('required')).toBe(true);
    expect(service.form.get('juzgadoId')?.hasError('required')).toBe(true);
  });

  it('isFieldInvalid devuelve true cuando campo es inválido y tocado', () => {
    service.form.get('username')?.setValue('');
    service.form.get('username')?.markAsTouched();
    expect(service.isFieldInvalid('username')).toBe(true);
  });

  it('isFieldInvalid devuelve false cuando campo es válido', () => {
    service.form.get('username')?.setValue('validuser');
    service.form.get('username')?.markAsTouched();
    expect(service.isFieldInvalid('username')).toBe(false);
  });

  it('cancelar navega a /admin/usuarios', () => {
    service.cancelar();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/usuarios']);
  });

  it('guardar con form inválido no llama al servicio', () => {
    service.form.patchValue({ username: '', email: 'bad' });
    service.guardar();
    expect(adminSpy.createUsuario).not.toHaveBeenCalled();
  });

  it('guardar en modo creación llama a createUsuario y navega', () => {
    adminSpy.createUsuario.and.returnValue(of({ success: true, data: {} as any }));
    service.form.patchValue({
      username: 'newuser', nombreCompleto: 'Nuevo Usuario Completo',
      email: 'new@test.com', rolId: 1, juzgadoId: 1
    });
    service.guardar();
    expect(adminSpy.createUsuario).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/usuarios']);
  });

  it('guardar con error en creación desactiva submitting', () => {
    adminSpy.createUsuario.and.returnValue(throwError(() => ({ error: { message: 'Duplicado' } })));
    service.form.patchValue({
      username: 'dupeuser', nombreCompleto: 'Usuario Existente',
      email: 'dup@test.com', rolId: 1, juzgadoId: 1
    });
    service.guardar();
    expect(service.dto.submitting()).toBe(false);
  });
});
