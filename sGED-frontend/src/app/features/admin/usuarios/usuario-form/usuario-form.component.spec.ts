import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UsuarioFormComponent } from './usuario-form.component';
import { AdminUsuariosService } from '../../../../core/services/admin-usuarios.service';
import { MessageService } from 'primeng/api';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('UsuarioFormComponent', () => {
  let component: UsuarioFormComponent;
  let fixture: ComponentFixture<UsuarioFormComponent>;
  let adminUsuariosService: AdminUsuariosService;

  const mockActivatedRoute = {
    params: of({})
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuarioFormComponent, ReactiveFormsModule, HttpClientTestingModule, BrowserAnimationsModule],
      providers: [
        AdminUsuariosService,
        MessageService,
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UsuarioFormComponent);
    component = fixture.componentInstance;
    adminUsuariosService = TestBed.inject(AdminUsuariosService);
  });

  it('debe crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe estar en modo creación por defecto', () => {
    expect(component.isCreation).toBe(true);
  });

  it('debe validar que username sea requerido en creación', () => {
    component.form.patchValue({ username: '' });
    expect(component.form.get('username')?.hasError('required')).toBe(true);
  });

  it('debe validar longitud mínima de username', () => {
    component.form.patchValue({ username: 'ab' });
    expect(component.form.get('username')?.hasError('minlength')).toBe(true);
  });

  it('debe validar que email sea válido', () => {
    component.form.patchValue({ email: 'invalid-email' });
    expect(component.form.get('email')?.hasError('email')).toBe(true);
  });

  it('debe validar que nombreCompleto sea requerido', () => {
    component.form.patchValue({ nombreCompleto: '' });
    expect(component.form.get('nombreCompleto')?.hasError('required')).toBe(true);
  });

  it('debe validar que rolId sea requerido', () => {
    component.form.patchValue({ rolId: null });
    expect(component.form.get('rolId')?.hasError('required')).toBe(true);
  });

  it('debe validar que juzgadoId sea requerido', () => {
    component.form.patchValue({ juzgadoId: null });
    expect(component.form.get('juzgadoId')?.hasError('required')).toBe(true);
  });

  it('debe deshabilitar username en modo edición', () => {
    component.isCreation = false;
    component.ngOnInit();
    expect(component.form.get('username')?.disabled).toBe(true);
  });

  it('debe navegar a listado al cancelar', () => {
    spyOn(component['router'], 'navigate');
    component.cancelar();
    expect(component['router'].navigate).toHaveBeenCalledWith(['/admin/usuarios']);
  });

  it('debe retornar false cuando el campo es inválido', () => {
    component.form.get('username')?.setValue('');
    component.form.get('username')?.markAsTouched();
    expect(component.isFieldInvalid('username')).toBe(true);
  });

  it('debe retornar true cuando el campo es válido', () => {
    component.form.get('username')?.setValue('validuser');
    component.form.get('username')?.markAsTouched();
    expect(component.isFieldInvalid('username')).toBe(false);
  });
});
