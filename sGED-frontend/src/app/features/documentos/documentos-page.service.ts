import { Injectable, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { DocumentosService } from '../../core/services/documentos.service';
import { Documento } from './models/documento.model';
import { DocumentosPageDto } from './documentos-page.dto';
import { LoadState, ViewerType } from './documentos-page.types';

@Injectable()
export class DocumentosPageService {
  private readonly documentosCoreSvc = inject(DocumentosService);
  private readonly route             = inject(ActivatedRoute);
  private readonly destroyRef        = inject(DestroyRef);

  readonly dto = new DocumentosPageDto();

  constructor() {
    this.route.paramMap.pipe(
      map(params => Number(params.get('id'))),
      filter(id => !Number.isNaN(id) && id > 0),
      tap(id => {
        this.dto.expedienteId.set(id);
        this.dto.state.set(LoadState.Loading);
        this.dto.errorMessage.set('');
      }),
      switchMap(id => this.documentosCoreSvc.listar(id)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (response) => {
        this.dto.documentos.set(response.data ?? []);
        this.dto.state.set(LoadState.Success);
      },
      error: (error) => {
        this.dto.state.set(LoadState.Error);
        this.dto.errorMessage.set(error?.error?.message ?? 'No se pudo cargar documentos');
      }
    });
  }

  cargarDocumentos(): void {
    const id = this.dto.expedienteId();
    if (!id) return;
    this.dto.state.set(LoadState.Loading);
    this.dto.errorMessage.set('');
    this.documentosCoreSvc.listar(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.dto.documentos.set(response.data ?? []);
          this.dto.state.set(LoadState.Success);
        },
        error: (error) => {
          this.dto.state.set(LoadState.Error);
          this.dto.errorMessage.set(error?.error?.message ?? 'No se pudo cargar documentos');
        }
      });
  }

  onUploaded(): void {
    this.cargarDocumentos();
  }

  onVer(documento: Documento): void {
    const ext = documento.extension.toLowerCase();
    if (ext === 'avi' || ext === 'mov') {
      this.onDescargar(documento);
      return;
    }
    this.dto.viewerType.set(documento.categoria as ViewerType);
    this.dto.viewerUrl.set(this.documentosCoreSvc.getContenidoUrl(documento.id, 'inline'));
    this.dto.selectedDocumento.set(documento);
  }

  onDescargar(documento: Documento): void {
    window.open(this.documentosCoreSvc.getContenidoUrl(documento.id, 'attachment'), '_blank');
  }

  onImprimir(documento: Documento): void {
    window.open(this.documentosCoreSvc.getContenidoUrl(documento.id, 'inline'), '_blank');
    this.documentosCoreSvc.registrarImpresion(documento.id).subscribe();
  }

  onEliminar(documento: Documento): void {
    this.documentosCoreSvc.eliminar(documento.id).subscribe({
      next: () => this.cargarDocumentos(),
      error: (error) => {
        this.dto.errorMessage.set(error?.error?.message ?? 'No se pudo eliminar documento');
      }
    });
  }

  cerrarVisor(): void {
    this.dto.viewerType.set(null);
    this.dto.viewerUrl.set('');
    this.dto.selectedDocumento.set(null);
  }
}
