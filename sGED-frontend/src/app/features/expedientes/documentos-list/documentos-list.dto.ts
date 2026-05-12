import { signal } from '@angular/core';
import { Documento } from '../../documentos/models/documento.model';
import { AuthUser } from '../../../core/models/auth-user.model';

export class DocumentosListDto {
  readonly documentos = signal<Documento[]>([]);
  readonly loading = signal(false);
  readonly uploading = signal(false);
  readonly progress = signal(0);
  readonly errorMessages = signal<string[]>([]);
  readonly currentUser = signal<AuthUser | null>(null);
}
