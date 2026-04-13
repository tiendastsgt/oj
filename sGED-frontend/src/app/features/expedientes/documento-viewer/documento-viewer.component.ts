import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { DocumentosService } from '../../../core/services/documentos.service';
import { Documento } from '../../documentos/models/documento.model';

@Component({
  selector: 'app-documento-viewer',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, MessageModule],
  templateUrl: './documento-viewer.component.html',
  styleUrls: ['./documento-viewer.component.scss']
})
export class DocumentoViewerComponent implements OnChanges, OnDestroy {
  @Input() documento: Documento | null = null;
  @Output() close = new EventEmitter<void>();

  /** For <iframe> — requires bypassSecurityTrustResourceUrl */
  frameUrl: SafeResourceUrl | null = null;
  /** For <img>, <audio>, <video> — requires bypassSecurityTrustUrl */
  mediaUrl: SafeUrl | null = null;
  private rawBlobUrl: string | null = null;
  loading = false;
  error = '';

  constructor(
    private documentosService: DocumentosService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['documento']) {
      this.revocarBlobUrl();
      const doc = this.documento;
      if (doc && (this.isPdf || this.isImage || this.isAudio || this.isVideo)) {
        this.loading = true;
        this.error = '';
        this.documentosService.fetchContenidoBlob(doc.id).subscribe({
          next: (url) => {
            this.rawBlobUrl = url;
            // <iframe> (PDF) needs ResourceUrl; <img>/<audio>/<video> need SafeUrl
            this.frameUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
            this.mediaUrl = this.sanitizer.bypassSecurityTrustUrl(url);
            this.loading = false;
          },
          error: (err) => {
            this.error = err?.status === 401
              ? 'Sin autorización para ver este documento.'
              : 'Error al cargar el documento.';
            this.loading = false;
          }
        });
      }
    }
  }

  ngOnDestroy(): void {
    this.revocarBlobUrl();
  }

  private revocarBlobUrl(): void {
    if (this.rawBlobUrl) {
      URL.revokeObjectURL(this.rawBlobUrl);
      this.rawBlobUrl = null;
      this.frameUrl = null;
      this.mediaUrl = null;
    }
  }

  get isPdf(): boolean {
    return this.documento?.extension?.toLowerCase() === 'pdf';
  }

  get isImage(): boolean {
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(this.documento?.extension?.toLowerCase() ?? '');
  }

  get isAudio(): boolean {
    return ['mp3', 'wav', 'ogg'].includes(this.documento?.extension?.toLowerCase() ?? '');
  }

  get isVideo(): boolean {
    return ['mp4', 'webm', 'avi', 'mov'].includes(this.documento?.extension?.toLowerCase() ?? '');
  }

  download(): void {
    if (!this.documento) return;
    // For download we use blob fetch as well to attach auth header
    this.documentosService.fetchContenidoBlob(this.documento.id, 'attachment').subscribe({
      next: (url) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = this.documento?.nombreOriginal ?? 'documento';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      },
      error: () => {}
    });
  }
}
