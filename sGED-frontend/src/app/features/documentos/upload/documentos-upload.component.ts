import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
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
  imports: [CommonModule],
  templateUrl: './documentos-upload.component.html',
  styleUrls: ['./documentos-upload.component.scss']
})
export class DocumentosUploadComponent {
  @Input() expedienteId = 0;
  @Output() uploaded = new EventEmitter<void>();

  uploading = false;
  progress = 0;
  errorMessage = '';

  constructor(private documentosService: DocumentosService) {}

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
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.upload(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  private upload(file: File): void {
    if (!this.expedienteId) {
      this.errorMessage = 'Expediente inválido';
      return;
    }
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!EXTENSIONES_PERMITIDAS.includes(extension)) {
      this.errorMessage = 'Formato no permitido';
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      this.errorMessage = 'El archivo excede el tamaño máximo (100 MB)';
      return;
    }

    this.errorMessage = '';
    this.uploading = true;
    this.progress = 0;

    this.documentosService.cargar(this.expedienteId, file).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          const total = event.total ?? file.size;
          this.progress = Math.round((event.loaded / total) * 100);
        }
        if (event.type === HttpEventType.Response) {
          this.uploading = false;
          this.progress = 0;
          this.uploaded.emit();
        }
      },
      error: (error) => {
        this.uploading = false;
        this.progress = 0;
        this.errorMessage = error?.error?.message ?? 'Error al subir archivo';
      }
    });
  }
}
