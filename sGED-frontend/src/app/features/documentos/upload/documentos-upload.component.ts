import {
  ChangeDetectionStrategy, Component,
  EventEmitter, Input, Output, inject, signal
} from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageModule } from 'primeng/message';
import { DocumentosService } from '../../../core/services/documentos.service';

const MAX_SIZE_BYTES = 100 * 1024 * 1024;
const EXTENSIONES_PERMITIDAS = [
  'pdf', 'doc', 'docx',
  'jpg', 'jpeg', 'png', 'gif', 'bmp',
  'mp3', 'wav', 'ogg',
  'mp4', 'webm', 'avi', 'mov'
];

@Component({
  selector: 'app-documentos-upload',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule, ProgressBarModule, MessageModule],
  templateUrl: './documentos-upload.component.html',
  styleUrls: ['./documentos-upload.component.scss']
})
export class DocumentosUploadComponent {
  @Input() expedienteId = 0;
  @Output() uploaded = new EventEmitter<void>();

  readonly uploading = signal(false);
  readonly progress = signal(0);
  readonly errorMessage = signal('');
  readonly isDragOver = signal(false);

  private readonly documentosService = inject(DocumentosService);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.upload(file);
      input.value = '';
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) this.upload(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(): void {
    this.isDragOver.set(false);
  }

  private upload(file: File): void {
    if (!this.expedienteId) {
      this.errorMessage.set('Expediente inválido');
      return;
    }
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!EXTENSIONES_PERMITIDAS.includes(extension)) {
      this.errorMessage.set('Formato no permitido');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      this.errorMessage.set('El archivo excede el tamaño máximo (100 MB)');
      return;
    }

    this.errorMessage.set('');
    this.uploading.set(true);
    this.progress.set(0);

    this.documentosService.cargar(this.expedienteId, file).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          const total = event.total ?? file.size;
          this.progress.set(Math.round((event.loaded / total) * 100));
        }
        if (event.type === HttpEventType.Response) {
          this.uploading.set(false);
          this.progress.set(0);
          this.uploaded.emit();
        }
      },
      error: (err) => {
        this.uploading.set(false);
        this.progress.set(0);
        this.errorMessage.set(err?.error?.message ?? 'Error al subir archivo');
      }
    });
  }
}
