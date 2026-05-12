import { inject, Injectable, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpEventType } from '@angular/common/http';
import { DocumentosService } from '../../../core/services/documentos.service';
import { AuthService } from '../../../core/services/auth.service';
import { DocumentosListDto } from './documentos-list.dto';
import { Documento } from '../../documentos/models/documento.model';
import { EXTENSIONES_PERMITIDAS, MAX_SIZE_BYTES } from './documentos-list.types';

@Injectable()
export class DocumentosListService {
  private readonly documentosService = inject(DocumentosService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly dto = new DocumentosListDto();

  private expedienteId = 0;

  constructor() {
    this.dto.currentUser.set(this.authService.getCurrentUser());
  }

  cargarDocumentos(expedienteId: number): void {
    this.expedienteId = expedienteId;
    if (!expedienteId) {
      this.dto.errorMessages.set(['Expediente inválido']);
      return;
    }
    this.dto.loading.set(true);
    this.dto.errorMessages.set([]);

    this.documentosService.getDocumentos(expedienteId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.dto.documentos.set(response.data || []);
          this.dto.loading.set(false);
        },
        error: (error) => {
          this.dto.documentos.set([]);
          this.dto.loading.set(false);
          if (error?.status === 403) {
            this.dto.errorMessages.set(['Acceso denegado a documentos de este expediente']);
          } else {
            this.dto.errorMessages.set([error?.error?.message || 'Error al cargar documentos']);
          }
        }
      });
  }

  subirDocumento(file: File): void {
    const validationError = this.validateFile(file);
    if (validationError) {
      this.dto.errorMessages.set([validationError]);
      return;
    }
    this.dto.uploading.set(true);
    this.dto.progress.set(0);
    this.dto.errorMessages.set([]);

    this.documentosService.uploadDocumento(this.expedienteId, file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress) {
            const total = event.total ?? file.size;
            this.dto.progress.set(Math.round((event.loaded / total) * 100));
          }
          if (event.type === HttpEventType.Response) {
            this.dto.uploading.set(false);
            this.dto.progress.set(0);
            this.cargarDocumentos(this.expedienteId);
          }
        },
        error: (error) => {
          this.dto.uploading.set(false);
          this.dto.progress.set(0);
          this.dto.errorMessages.set(this.parseErrors(error));
        }
      });
  }

  eliminarDocumento(documento: Documento): void {
    this.documentosService.eliminar(documento.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.cargarDocumentos(this.expedienteId),
        error: (error) => {
          this.dto.errorMessages.set([error?.error?.message ?? 'No se pudo eliminar documento']);
        }
      });
  }

  descargarDocumento(documento: Documento): void {
    const url = this.documentosService.downloadDocumento(documento.id);
    window.open(url, '_blank');
  }

  imprimirDocumento(documento: Documento): void {
    const url = this.documentosService.streamDocumento(documento.id);
    window.open(url, '_blank');
    this.documentosService.registrarImpresion(documento.id).subscribe();
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
    if (file) this.subirDocumento(file);
  }

  canUpload(): boolean {
    return ['ADMINISTRADOR', 'SECRETARIO', 'AUXILIAR'].includes(
      this.dto.currentUser()?.rol ?? ''
    );
  }

  canDelete(): boolean {
    return ['ADMINISTRADOR', 'SECRETARIO'].includes(this.dto.currentUser()?.rol ?? '');
  }

  getFormatIcon(ext: string): string {
    const e = ext.toLowerCase();
    if (e === 'pdf') return 'pi pi-file-pdf';
    if (['doc', 'docx'].includes(e)) return 'pi pi-file-word';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(e)) return 'pi pi-image';
    if (['mp4', 'webm', 'mov'].includes(e)) return 'pi pi-video';
    if (['mp3', 'wav', 'ogg'].includes(e)) return 'pi pi-volume-up';
    return 'pi pi-file';
  }

  getFormatClass(ext: string): string {
    const e = ext.toLowerCase();
    if (e === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(e)) return 'word';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(e)) return 'img';
    if (['mp4', 'webm', 'mov'].includes(e)) return 'video';
    if (['mp3', 'wav', 'ogg'].includes(e)) return 'audio';
    return 'other';
  }

  private validateFile(file: File): string | null {
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!EXTENSIONES_PERMITIDAS.includes(extension)) return 'Formato de archivo no permitido.';
    if (file.size > MAX_SIZE_BYTES) return 'El archivo excede el límite de 100 MB.';
    return null;
  }

  private parseErrors(error: unknown): string[] {
    const payload = (error as { error?: { errors?: unknown; message?: string } })?.error;
    if (payload?.errors && Array.isArray(payload.errors)) {
      return payload.errors.map((entry) => String(entry));
    }
    if (payload?.message) return [payload.message];
    return ['No se pudo subir el documento'];
  }
}
