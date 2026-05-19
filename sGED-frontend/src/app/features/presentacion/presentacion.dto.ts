import { computed, signal } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { PresentacionDoc } from './presentacion.types';

export class PresentacionDto {
  expedienteNum = signal('');
  docs          = signal<PresentacionDoc[]>([]);
  activeDocIdx  = signal(0);
  docBlobUrls   = signal<(SafeResourceUrl | null)[]>([]);

  readonly total = computed(() => this.docs().length);
}
