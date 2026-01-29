import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../core/services/auth.service';
import { ChangePasswordRequest } from '../../../core/models/change-password-request.model';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const DEFAULT_REDIRECT = '/expedientes';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    PasswordModule,
    ButtonModule,
    MessageModule
  ],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
  loading = false;
  errorMessages: string[] = [];
  successMessage = '';

  form = this.fb.nonNullable.group(
    {
      passwordActual: ['', Validators.required],
      passwordNuevo: ['', [Validators.required, Validators.pattern(PASSWORD_REGEX)]],
      passwordConfirmacion: ['', Validators.required]
    },
    { validators: [this.passwordsMatch] }
  );

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.errorMessages = [];
    this.successMessage = '';

    const payload = this.form.getRawValue() as ChangePasswordRequest;
    this.authService.changePassword(payload).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = response.message ?? 'Contraseña actualizada correctamente';
        setTimeout(() => this.router.navigate([DEFAULT_REDIRECT]), 800);
      },
      error: (error) => {
        this.loading = false;
        const errors = error?.error?.errors;
        if (Array.isArray(errors)) {
          this.errorMessages = errors.map((entry: unknown) => {
            if (typeof entry === 'string') {
              return entry;
            }
            if (entry && typeof entry === 'object' && 'message' in entry) {
              return String((entry as { message?: string }).message);
            }
            return 'Error de validación';
          });
        } else if (error?.error?.message) {
          this.errorMessages = [error.error.message];
        } else {
          this.errorMessages = ['No se pudo actualizar la contraseña'];
        }
      }
    });
  }

  isInvalid(controlName: 'passwordActual' | 'passwordNuevo' | 'passwordConfirmacion'): boolean {
    const control = this.form.get(controlName);
    return Boolean(control && control.touched && control.invalid);
  }

  hasPasswordMismatch(): boolean {
    return Boolean(this.form.hasError('passwordMismatch') && this.form.get('passwordConfirmacion')?.touched);
  }

  private passwordsMatch(control: AbstractControl): ValidationErrors | null {
    const password = control.get('passwordNuevo')?.value;
    const confirm = control.get('passwordConfirmacion')?.value;
    if (!password || !confirm) {
      return null;
    }
    return password === confirm ? null : { passwordMismatch: true };
  }
}
