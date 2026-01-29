import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../core/services/auth.service';

const DEFAULT_REDIRECT = '/expedientes';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loading = false;
  errorMessage = '';

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.errorMessage = '';

    const credentials = this.form.getRawValue();
    this.authService.login(credentials).subscribe({
      next: (data) => {
        this.loading = false;
        if (data.debeCambiarPassword) {
          this.router.navigate(['/cambiar-password']);
        } else {
          this.router.navigate([DEFAULT_REDIRECT]);
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error?.error?.message ?? 'No se pudo iniciar sesión. Intente nuevamente.';
      }
    });
  }

  isInvalid(controlName: 'username' | 'password'): boolean {
    const control = this.form.get(controlName);
    return Boolean(control && control.touched && control.invalid);
  }
}
