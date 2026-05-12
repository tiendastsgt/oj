import { computed, signal } from '@angular/core';
import { SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { Documento } from '../../documentos/models/documento.model';

export class DocumentoViewerDto {
  readonly documento = signal<Documento | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly frameUrl = signal<SafeResourceUrl | null>(null);
  readonly mediaUrl = signal<SafeUrl | null>(null);
  readonly rawBlobUrl = signal<string | null>(null);
  readonly previewAsPdf = signal(false);
  readonly readingModeActive = signal(false);
  readonly isFullscreen = signal(false);

  readonly isPdf = computed(() => this.documento()?.extension?.toLowerCase() === 'pdf');
  readonly isImage = computed(() =>
    ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(this.documento()?.extension?.toLowerCase() ?? '')
  );
  readonly isAudio = computed(() =>
    ['mp3', 'wav', 'ogg'].includes(this.documento()?.extension?.toLowerCase() ?? '')
  );
  readonly isVideo = computed(() =>
    ['mp4', 'webm', 'avi', 'mov'].includes(this.documento()?.extension?.toLowerCase() ?? '')
  );
  readonly isWord = computed(() =>
    ['doc', 'docx'].includes(this.documento()?.extension?.toLowerCase() ?? '')
  );
  readonly blobReady = computed(() => !!this.rawBlobUrl());
  readonly fileIcon = computed(() => {
    if (this.isPdf()) return 'pi-file-pdf';
    if (this.isWord()) return 'pi-file-word';
    if (this.isImage()) return 'pi-image';
    if (this.isAudio()) return 'pi-headphones';
    if (this.isVideo()) return 'pi-video';
    return 'pi-file';
  });
}
