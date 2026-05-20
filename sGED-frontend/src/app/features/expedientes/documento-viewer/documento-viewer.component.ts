import {
  AfterViewChecked, ChangeDetectionStrategy, Component,
  ElementRef, HostListener, OnDestroy, ViewChild, effect, inject, input, output, untracked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Documento } from '../../documentos/models/documento.model';
import { DocumentoViewerService } from './documento-viewer.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-documento-viewer',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, MessageModule, ToastModule],
  providers: [DocumentoViewerService, MessageService],
  templateUrl: './documento-viewer.component.html',
  styleUrls: ['./documento-viewer.component.scss'],
})
export class DocumentoViewerComponent implements OnDestroy, AfterViewChecked {
  documento = input<Documento | null>(null);
  showClose = input<boolean>(true);
  close = output<void>();
  readingMode = output<boolean>();

  @ViewChild('audioPlayer') audioPlayerRef?: ElementRef<HTMLAudioElement>;
  @ViewChild('videoPlayer') videoPlayerRef?: ElementRef<HTMLVideoElement>;

  protected svc = inject(DocumentoViewerService);
  protected dto = this.svc.dto;
  private mediaSrcApplied = false;

  constructor() {
    effect(() => {
      const doc = this.documento();
      untracked(() => {
        this.mediaSrcApplied = false;
        this.svc.loadDocumento(doc);
      });
    });
  }

  ngAfterViewChecked(): void {
    if (this.mediaSrcApplied || !this.dto.rawBlobUrl()) return;
    if (this.dto.isAudio() && this.audioPlayerRef?.nativeElement) {
      const el = this.audioPlayerRef.nativeElement;
      if (!el.src?.startsWith('blob:')) { el.src = this.dto.rawBlobUrl()!; el.load(); this.mediaSrcApplied = true; }
    }
    if (this.dto.isVideo() && this.videoPlayerRef?.nativeElement) {
      const el = this.videoPlayerRef.nativeElement;
      if (!el.src?.startsWith('blob:')) { el.src = this.dto.rawBlobUrl()!; el.load(); this.mediaSrcApplied = true; }
    }
  }

  ngOnDestroy(): void {
    this.svc.revocarBlobUrl();
  }

  onReadingModeToggle(): void {
    this.svc.toggleReadingMode();
    this.readingMode.emit(this.dto.readingModeActive());
  }

  @HostListener('document:fullscreenchange')
  @HostListener('document:webkitfullscreenchange')
  onFullscreenChange(): void {
    this.dto.isFullscreen.set(!!(document.fullscreenElement || (document as unknown as Record<string, Element>)['webkitFullscreenElement']));
  }
}
