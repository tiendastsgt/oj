import { inject, Injectable, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginDto } from './login.dto';
import { DEFAULT_REDIRECT } from './login.types';

@Injectable()
export class LoginService {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly dto = new LoginDto();

  readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dto.loading.set(true);
    this.dto.errorMessage.set('');

    const credentials = this.form.getRawValue();
    this.authService.login(credentials)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.dto.loading.set(false);
          if (data.debeCambiarPassword) {
            this.router.navigate(['/cambiar-password']);
          } else {
            this.router.navigate([DEFAULT_REDIRECT]);
          }
        },
        error: (error) => {
          this.dto.loading.set(false);
          this.dto.errorMessage.set(
            error?.error?.message ?? 'No se pudo iniciar sesión. Intente nuevamente.'
          );
        }
      });
  }

  isInvalid(controlName: 'username' | 'password'): boolean {
    const control = this.form.get(controlName);
    return Boolean(control && control.touched && control.invalid);
  }
}
