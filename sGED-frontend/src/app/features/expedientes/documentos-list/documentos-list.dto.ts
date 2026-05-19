import { signal } from '@angular/core';
import { Documento } from '../../documentos/models/documento.model';
import { AuthUser } from '../../../core/models/auth-user.model';
import { MOCK_DOCUMENTOS_EXP1 } from '../../../core/mocks/documentos.mock';

export class DocumentosListDto {
  readonly documentos     = signal<Documento[]>(MOCK_DOCUMENTOS_EXP1);
  readonly loading        = signal(false);
  readonly uploading      = signal(false);
  readonly progress       = signal(0);
  readonly errorMessages  = signal<string[]>([]);
  readonly currentUser    = signal<AuthUser | null>(null);
}
