import { computed, signal } from '@angular/core';
import { MOCK_PRESENTACION_DOCS, PresentacionDoc } from './presentacion.types';
import { environment } from '../../../environments/environment';

export class PresentacionDto {
  expedienteNum = signal('01173-2026-00045');
  docs          = signal<PresentacionDoc[]>(environment.useMocks ? MOCK_PRESENTACION_DOCS : []);
  activeDocIdx  = signal(0);

  readonly total = computed(() => this.docs().length);
}
