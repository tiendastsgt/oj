import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ChangePasswordComponent } from './change-password.component';

describe('ChangePasswordComponent', () => {
  let component: ChangePasswordComponent;
  let fixture: ComponentFixture<ChangePasswordComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['changePassword']);
    await TestBed.configureTestingModule({
      imports: [ChangePasswordComponent, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authService }]
    }).compileComponents();

    fixture = TestBed.createComponent(ChangePasswordComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should mark form invalid when password policy fails', () => {
    component.form.setValue({
      passwordActual: 'Actual123',
      passwordNuevo: 'short',
      passwordConfirmacion: 'short'
    });
    expect(component.form.invalid).toBeTrue();
  });

  it('should detect password mismatch', () => {
    component.form.setValue({
      passwordActual: 'Actual123',
      passwordNuevo: 'NuevaPassword1',
      passwordConfirmacion: 'OtraPassword1'
    });
    component.form.get('passwordConfirmacion')?.markAsTouched();
    expect(component.hasPasswordMismatch()).toBeTrue();
  });

  it('should show backend validation errors', () => {
    authService.changePassword.and.returnValue(
      throwError(() => ({ error: { errors: ['La confirmación no coincide'] } }))
    );
    component.form.setValue({
      passwordActual: 'Actual123',
      passwordNuevo: 'NuevaPassword1',
      passwordConfirmacion: 'NuevaPassword1'
    });
    component.onSubmit();
    expect(component.errorMessages).toEqual(['La confirmación no coincide']);
  });

  it('should navigate after successful change', fakeAsync(() => {
    authService.changePassword.and.returnValue(of({ success: true, message: 'OK' }));
    const navigateSpy = spyOn(router, 'navigate');
    component.form.setValue({
      passwordActual: 'Actual123',
      passwordNuevo: 'NuevaPassword1',
      passwordConfirmacion: 'NuevaPassword1'
    });
    component.onSubmit();
    tick(800);
    expect(navigateSpy).toHaveBeenCalledWith(['/expedientes']);
  }));
});
