import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  HostListener
} from '@angular/core';
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
export class DocumentoViewerComponent implements OnChanges, OnDestroy, AfterViewChecked {
  @Input() documento: Documento | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() readingMode = new EventEmitter<boolean>();

  readingModeActive = false;
  isFullscreen = false;

  @ViewChild('audioPlayer') audioPlayerRef?: ElementRef<HTMLAudioElement>;
  @ViewChild('videoPlayer') videoPlayerRef?: ElementRef<HTMLVideoElement>;

  /** For <iframe> — requires bypassSecurityTrustResourceUrl */
  frameUrl: SafeResourceUrl | null = null;
  /** For <img> — requires bypassSecurityTrustUrl */
  mediaUrl: SafeUrl | null = null;
  /** Raw blob URL string for audio/video native elements */
  rawBlobUrl: string | null = null;

  loading = false;
  error = '';

  /** Track whether we've set the src on native media elements */
  private mediaSrcApplied = false;

  constructor(
    private documentosService: DocumentosService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['documento']) {
      this.revocarBlobUrl();
      this.mediaSrcApplied = false;
      const doc = this.documento;
      if (doc && (this.isPdf || this.isImage || this.isAudio || this.isVideo)) {
        this.loading = true;
        this.error = '';
        this.documentosService.fetchContenidoBlob(doc.id).subscribe({
          next: (url) => {
            this.rawBlobUrl = url;
            // Si es PDF, añadir parámetro para ancho completo por defecto
            const viewerUrl = this.isPdf ? `${url}#view=FitH` : url;
            this.frameUrl = this.sanitizer.bypassSecurityTrustResourceUrl(viewerUrl);
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

  /**
   * After each view check, inject the raw blob URL directly into the native
   * <audio>/<video> element. This bypasses Angular's sanitization which can
   * silently block blob: URLs on media elements in some browsers.
   */
  ngAfterViewChecked(): void {
    if (this.mediaSrcApplied || !this.rawBlobUrl) return;

    if (this.isAudio && this.audioPlayerRef?.nativeElement) {
      const el = this.audioPlayerRef.nativeElement;
      if (!el.src || !el.src.startsWith('blob:')) {
        el.src = this.rawBlobUrl;
        el.load();
        this.mediaSrcApplied = true;
      }
    }

    if (this.isVideo && this.videoPlayerRef?.nativeElement) {
      const el = this.videoPlayerRef.nativeElement;
      if (!el.src || !el.src.startsWith('blob:')) {
        el.src = this.rawBlobUrl;
        el.load();
        this.mediaSrcApplied = true;
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
      this.mediaSrcApplied = false;
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

  /** Whether the blob has been loaded (used in template to show media sections) */
  get blobReady(): boolean {
    return !!this.rawBlobUrl;
  }

  download(): void {
    if (!this.documento) return;
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

  get fileIcon(): string {
    if (this.isPdf) return 'pi-file-pdf';
    if (this.isImage) return 'pi-image';
    if (this.isAudio) return 'pi-headphones';
    if (this.isVideo) return 'pi-video';
    return 'pi-file';
  }

  formatSize(bytes: number | undefined): string {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  toggleReadingMode(): void {
    this.readingModeActive = !this.readingModeActive;
    this.readingMode.emit(this.readingModeActive);
  }

  toggleFullscreen(): void {
    const el = document.querySelector('.elite-viewer') as any;
    if (!el) return;

    if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
      const requestMethod = el.requestFullscreen || el.webkitRequestFullscreen;
      if (requestMethod) {
        requestMethod.call(el).catch((err: any) => {
          console.error(`Error enabling fullscreen: ${err.message}`);
        });
      }
    } else {
      const exitMethod = document.exitFullscreen || (document as any).webkitExitFullscreen;
      if (exitMethod) {
        exitMethod.call(document);
      }
    }
  }

  @HostListener('document:fullscreenchange', ['$event'])
  @HostListener('document:webkitfullscreenchange', ['$event'])
  onFullscreenChange(event?: any): void {
    this.isFullscreen = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
  }

  openExternal(): void {
    if (this.rawBlobUrl) {
      window.open(this.rawBlobUrl, '_blank', 'noopener,noreferrer');
    }
  }
}
