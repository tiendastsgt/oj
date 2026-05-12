import { inject, Injectable, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { MessageService } from 'primeng/api';
import { DocumentosService } from '../../../core/services/documentos.service';
import { Documento } from '../../documentos/models/documento.model';
import { DocumentoViewerDto } from './documento-viewer.dto';

@Injectable()
export class DocumentoViewerService {
  private readonly documentosService = inject(DocumentosService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly dto = new DocumentoViewerDto();

  loadDocumento(documento: Documento | null): void {
    this.revocarBlobUrl();
    this.dto.previewAsPdf.set(false);
    this.dto.documento.set(documento);
    if (!documento) return;
    if (!(this.dto.isPdf() || this.dto.isImage() || this.dto.isAudio() || this.dto.isVideo() || this.dto.isWord())) return;

    this.dto.loading.set(true);
    this.dto.error.set('');

    this.documentosService.fetchContenidoBlob(documento.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ url, conversionFailed }) => {
          if (conversionFailed) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Vista previa no disponible',
              detail: 'No se pudo previsualizar. Se descargará automáticamente.',
              life: 5000
            });
            const a = document.createElement('a');
            a.href = url;
            a.download = documento.nombreOriginal ?? 'documento';
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 5000);
            this.dto.error.set('No se pudo generar la vista previa. Se descargó el archivo original.');
            this.dto.loading.set(false);
            return;
          }
          this.dto.rawBlobUrl.set(url);
          this.dto.previewAsPdf.set(this.dto.isWord());
          const showAsPdf = this.dto.isPdf() || this.dto.previewAsPdf();
          const viewerUrl = showAsPdf ? `${url}#view=FitH` : url;
          this.dto.frameUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(viewerUrl));
          this.dto.mediaUrl.set(this.sanitizer.bypassSecurityTrustUrl(url));
          this.dto.loading.set(false);
        },
        error: (err) => {
          this.dto.error.set(
            err?.status === 401
              ? 'Sin autorización para ver este documento.'
              : 'Error al cargar el documento.'
          );
          this.dto.loading.set(false);
        }
      });
  }

  revocarBlobUrl(): void {
    const url = this.dto.rawBlobUrl();
    if (url) {
      URL.revokeObjectURL(url);
      this.dto.rawBlobUrl.set(null);
      this.dto.frameUrl.set(null);
      this.dto.mediaUrl.set(null);
      this.dto.previewAsPdf.set(false);
    }
  }

  download(): void {
    const doc = this.dto.documento();
    if (!doc) return;
    this.documentosService.fetchContenidoBlob(doc.id, 'attachment')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ url }) => {
          const a = document.createElement('a');
          a.href = url;
          a.download = doc.nombreOriginal ?? 'documento';
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 5000);
        },
        error: () => {}
      });
  }

  toggleReadingMode(): void {
    this.dto.readingModeActive.update(v => !v);
  }

  toggleFullscreen(): void {
    const el = document.querySelector('.elite-viewer') as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
    };
    if (!el) return;

    if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
      const requestMethod = el.requestFullscreen ?? el.webkitRequestFullscreen;
      if (requestMethod) requestMethod.call(el).catch(() => {});
    } else {
      const exitMethod = document.exitFullscreen ?? (document as any).webkitExitFullscreen;
      if (exitMethod) exitMethod.call(document);
    }
  }

  openExternal(): void {
    const url = this.dto.rawBlobUrl();
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }

  formatSize(bytes: number | undefined): string {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }
}
