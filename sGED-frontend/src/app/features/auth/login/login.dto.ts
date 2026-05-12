import { signal } from '@angular/core';

export class LoginDto {
  readonly loading = signal(false);
  readonly errorMessage = signal('');
}
