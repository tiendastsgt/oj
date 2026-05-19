import { signal, computed } from '@angular/core';
import { Documento } from './models/documento.model';
import { ViewerType, LoadState } from './documentos-page.types';
import { MOCK_DOCUMENTOS_EXP1 } from '../../core/mocks/documentos.mock';

export class DocumentosPageDto {
  state     = signal<LoadState>(LoadState.Idle);
  isLoading = computed(() => this.state() === LoadState.Loading);
  hasError  = computed(() => this.state() === LoadState.Error);

  expedienteId      = signal<number>(1);
  documentos        = signal<Documento[]>(MOCK_DOCUMENTOS_EXP1);
  errorMessage      = signal<string>('');

  viewerType        = signal<ViewerType>(null);
  viewerUrl         = signal<string>('');
  selectedDocumento = signal<Documento | null>(null);
  viewerVisible     = computed(() => this.viewerType() !== null);
  viewerTitle       = computed(() =>
    this.selectedDocumento()?.nombreOriginal ?? 'Visor de Documentos'
  );

  showPdfViewer   = computed(() => this.viewerType() === 'PDF' || this.viewerType() === 'WORD');
  showImageViewer = computed(() => this.viewerType() === 'IMAGEN');
  showAudioPlayer = computed(() => this.viewerType() === 'AUDIO');
  showVideoPlayer = computed(() => this.viewerType() === 'VIDEO');
}
