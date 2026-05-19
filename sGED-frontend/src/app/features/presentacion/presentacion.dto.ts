import { computed, signal } from '@angular/core';
import { DEMO_SAMPLE_PDFS, MOCK_PRESENTACION_DOCS, PresentacionDoc } from './presentacion.types';
import { environment } from '../../../environments/environment';

export class PresentacionDto {
  expedienteNum  = signal('01173-2026-00045');
  docs           = signal<PresentacionDoc[]>(environment.useMocks ? MOCK_PRESENTACION_DOCS : []);
  activeDocIdx   = signal(0);
  docAssetUrls   = signal<(string | null)[]>(
    environment.useMocks
      ? MOCK_PRESENTACION_DOCS.map((_, i) => DEMO_SAMPLE_PDFS[i % DEMO_SAMPLE_PDFS.length])
      : []
  );
  docFetchErrors = signal<Set<number>>(new Set());

  readonly total = computed(() => this.docs().length);
}
