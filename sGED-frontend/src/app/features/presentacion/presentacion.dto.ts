import { computed, signal } from '@angular/core';
import { PresentacionDoc, MergeState } from './presentacion.types';

export class PresentacionDto {
  expedienteNum    = signal<string>('');
  docs             = signal<PresentacionDoc[]>([]);

  mergedPdfUrl     = signal<string | null>(null);
  pageOffsets      = signal<number[]>([]);
  totalPages       = signal<number>(0);
  mergeState       = signal<MergeState>('idle');
  mergeError       = signal<string | null>(null);
  scrollTargetTick = signal<{ page: number; nonce: number } | null>(null);

  activeDocIdx     = signal<number>(0);

  readonly total = computed(() => this.docs().length);
}
