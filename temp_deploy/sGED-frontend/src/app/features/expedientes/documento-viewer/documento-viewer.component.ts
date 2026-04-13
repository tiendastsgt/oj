import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
export class DocumentoViewerComponent {
  @Input() documento: Documento | null = null;
  @Output() close = new EventEmitter<void>();

  constructor(private documentosService: DocumentosService, private sanitizer: DomSanitizer) {}

  get inlineUrl(): SafeResourceUrl {
    const url = this.documento ? this.documentosService.streamDocumento(this.documento.id) : '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
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

  get isWord(): boolean {
    return ['doc', 'docx'].includes(this.documento?.extension?.toLowerCase() ?? '');
  }

  download(): void {
    if (!this.documento) {
      return;
    }
    const url = this.documentosService.downloadDocumento(this.documento.id);
    window.open(url, '_blank');
  }
}
