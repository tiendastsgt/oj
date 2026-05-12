import { signal } from '@angular/core';

export class ChangePasswordDto {
  readonly loading = signal(false);
  readonly errorMessages = signal<string[]>([]);
  readonly successMessage = signal('');
}
