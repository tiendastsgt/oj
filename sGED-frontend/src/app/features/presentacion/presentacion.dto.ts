import { computed, signal } from '@angular/core';
import { Documento } from '../documentos/models/documento.model';
import { PresentacionDoc, toDocumento } from './presentacion.types';

export class PresentacionDto {
  expedienteNum = signal('');
  docs = signal<PresentacionDoc[]>([]);
  currentIdx = signal(0);

  readonly current = computed(() => this.docs()[this.currentIdx()] ?? null);
  readonly total   = computed(() => this.docs().length);
  readonly isFirst = computed(() => this.currentIdx() === 0);
  readonly isLast  = computed(() => this.currentIdx() >= this.total() - 1);

  readonly currentDocumento = computed<Documento | null>(() => {
    const d = this.current();
    return d ? toDocumento(d) : null;
  });
}
