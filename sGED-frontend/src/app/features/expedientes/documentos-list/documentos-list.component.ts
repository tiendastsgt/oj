import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { AuthService } from '../../../core/services/auth.service';
import { DocumentosService } from '../../../core/services/documentos.service';
import { AuthUser } from '../../../core/models/auth-user.model';
import { Documento } from '../../documentos/models/documento.model';

const MAX_SIZE_BYTES = 100 * 1024 * 1024;
const EXTENSIONES_PERMITIDAS = [
  'pdf', 'doc', 'docx',
  'jpg', 'jpeg', 'png', 'gif', 'bmp',
  'mp3', 'wav', 'ogg',
  'mp4', 'webm', 'avi', 'mov'
];

@Component({
  selector: 'app-documentos-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, CardModule, MessageModule, ProgressBarModule],
  templateUrl: './documentos-list.component.html',
  styleUrls: ['./documentos-list.component.scss']
})
export class DocumentosListComponent implements OnInit {
  @Input() expedienteId = 0;
  @Output() viewDocumento = new EventEmitter<Documento>();

  documentos: Documento[] = [];
  loading = false;
  uploading = false;
  progress = 0;
  errorMessages: string[] = [];
  currentUser: AuthUser | null = null;

  constructor(private documentosService: DocumentosService, private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.cargarDocumentos();
  }

  canUpload(): boolean {
    return ['ADMINISTRADOR', 'SECRETARIO', 'AUXILIAR'].includes(this.currentUser?.rol ?? '');
  }

  canDelete(): boolean {
    return ['ADMINISTRADOR', 'SECRETARIO'].includes(this.currentUser?.rol ?? '');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.subirDocumento(file);
      input.value = '';
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.subirDocumento(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onVer(documento: Documento): void {
    this.viewDocumento.emit(documento);
  }

  onDescargar(documento: Documento): void {
    const url = this.documentosService.downloadDocumento(documento.id);
    window.open(url, '_blank');
  }

  onImprimir(documento: Documento): void {
    const url = this.documentosService.streamDocumento(documento.id);
    window.open(url, '_blank');
    this.documentosService.registrarImpresion(documento.id).subscribe();
  }

  onEliminar(documento: Documento): void {
    this.documentosService.eliminar(documento.id).subscribe({
      next: () => this.cargarDocumentos(),
      error: (error) => {
        this.errorMessages = [error?.error?.message ?? 'No se pudo eliminar documento'];
      }
    });
  }

  private cargarDocumentos(): void {
    if (!this.expedienteId) {
      this.errorMessages = ['Expediente inválido'];
      return;
    }
    this.loading = true;
    this.errorMessages = [];
    this.documentosService.getDocumentos(this.expedienteId).subscribe({
      next: (response) => {
        this.documentos = response.data ?? [];
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        if (error?.status === 403) {
          this.errorMessages = ['Acceso denegado a documentos de este expediente'];
        } else {
          this.errorMessages = [error?.error?.message ?? 'No se pudo cargar documentos'];
        }
      }
    });
  }

  private subirDocumento(file: File): void {
    const validationError = this.validateFile(file);
    if (validationError) {
      this.errorMessages = [validationError];
      return;
    }

    this.uploading = true;
    this.progress = 0;
    this.errorMessages = [];

    this.documentosService.uploadDocumento(this.expedienteId, file).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          const total = event.total ?? file.size;
          this.progress = Math.round((event.loaded / total) * 100);
        }
        if (event.type === HttpEventType.Response) {
          this.uploading = false;
          this.progress = 0;
          this.cargarDocumentos();
        }
      },
      error: (error) => {
        this.uploading = false;
        this.progress = 0;
        this.errorMessages = this.parseErrors(error);
      }
    });
  }

  validateFile(file: File): string | null {
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!EXTENSIONES_PERMITIDAS.includes(extension)) {
      return 'Formato de archivo no permitido.';
    }
    if (file.size > MAX_SIZE_BYTES) {
      return 'El archivo excede el límite de 100 MB.';
    }
    return null;
  }

  private parseErrors(error: unknown): string[] {
    const payload = (error as { error?: { errors?: unknown; message?: string } })?.error;
    if (payload?.errors && Array.isArray(payload.errors)) {
      return payload.errors.map((entry) => String(entry));
    }
    if (payload?.message) {
      return [payload.message];
    }
    return ['No se pudo subir el documento'];
  }
}
