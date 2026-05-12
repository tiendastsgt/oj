import { inject, Injectable, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ChangePasswordDto } from './change-password.dto';
import { PASSWORD_REGEX, DEFAULT_REDIRECT } from './change-password.types';

@Injectable()
export class ChangePasswordService {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly dto = new ChangePasswordDto();

  private readonly passwordsMatch = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('passwordNuevo')?.value;
    const confirm = control.get('passwordConfirmacion')?.value;
    if (!password || !confirm) return null;
    return password === confirm ? null : { passwordMismatch: true };
  };

  readonly form = this.fb.nonNullable.group(
    {
      passwordActual: ['', Validators.required],
      passwordNuevo: ['', [Validators.required, Validators.pattern(PASSWORD_REGEX)]],
      passwordConfirmacion: ['', Validators.required]
    },
    { validators: [this.passwordsMatch] }
  );

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dto.loading.set(true);
    this.dto.errorMessages.set([]);
    this.dto.successMessage.set('');

    const payload = this.form.getRawValue();
    this.authService.changePassword(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.dto.loading.set(false);
          this.dto.successMessage.set(response.message ?? 'Contraseña actualizada correctamente');
          this.router.navigate([DEFAULT_REDIRECT]);
        },
        error: (error) => {
          this.dto.loading.set(false);
          const errors = error?.error?.errors;
          if (Array.isArray(errors)) {
            this.dto.errorMessages.set(errors.map((entry: unknown) => {
              if (typeof entry === 'string') return entry;
              if (entry && typeof entry === 'object' && 'message' in entry) {
                return String((entry as { message?: string }).message);
              }
              return 'Error de validación';
            }));
          } else if (error?.error?.message) {
            this.dto.errorMessages.set([error.error.message]);
          } else {
            this.dto.errorMessages.set(['No se pudo actualizar la contraseña']);
          }
        }
      });
  }

  isInvalid(controlName: 'passwordActual' | 'passwordNuevo' | 'passwordConfirmacion'): boolean {
    const control = this.form.get(controlName);
    return Boolean(control && control.touched && control.invalid);
  }

  hasPasswordMismatch(): boolean {
    return Boolean(
      this.form.hasError('passwordMismatch') && this.form.get('passwordConfirmacion')?.touched
    );
  }
}
