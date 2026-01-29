import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['login']);
    await TestBed.configureTestingModule({
      imports: [LoginComponent, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authService }]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should not submit when form is invalid', () => {
    component.form.setValue({ username: '', password: '' });
    component.onSubmit();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should show error message on 401', () => {
    authService.login.and.returnValue(
      throwError(() => ({ status: 401, error: { message: 'Usuario o contraseña incorrectos' } }))
    );
    component.form.setValue({ username: 'jperez', password: 'Secret123' });
    component.onSubmit();
    expect(component.errorMessage).toBe('Usuario o contraseña incorrectos');
  });

  it('should navigate to change password when required', () => {
    authService.login.and.returnValue(
      of({
        token: 'token',
        username: 'jperez',
        nombreCompleto: 'Juan Perez',
        rol: 'SECRETARIO',
        debeCambiarPassword: true
      })
    );
    const navigateSpy = spyOn(router, 'navigate');
    component.form.setValue({ username: 'jperez', password: 'Secret123' });
    component.onSubmit();
    expect(navigateSpy).toHaveBeenCalledWith(['/cambiar-password']);
  });
});
