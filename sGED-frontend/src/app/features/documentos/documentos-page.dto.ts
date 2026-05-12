import { signal, computed } from '@angular/core';
import { Documento } from './models/documento.model';
import { ViewerType, LoadState } from './documentos-page.types';

export class DocumentosPageDto {
  state     = signal<LoadState>(LoadState.Loading);
  isLoading = computed(() => this.state() === LoadState.Loading);
  hasError  = computed(() => this.state() === LoadState.Error);

  expedienteId      = signal<number>(0);
  documentos        = signal<Documento[]>([]);
  errorMessage      = signal<string>('');

  viewerType        = signal<ViewerType>(null);
  viewerUrl         = signal<string>('');
  selectedDocumento = signal<Documento | null>(null);
  viewerVisible     = computed(() => this.viewerType() !== null);
  viewerTitle       = computed(() =>
    this.selectedDocumento()?.nombreOriginal ?? 'Visor de Documentos'
  );
}
