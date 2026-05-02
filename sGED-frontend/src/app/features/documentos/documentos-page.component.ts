import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { DocumentosService } from '../../core/services/documentos.service';
import { Documento } from './models/documento.model';
import { DocumentosUploadComponent } from './upload/documentos-upload.component';
import { DocumentosListComponent } from './list/documentos-list.component';
import { VisorPdfComponent } from './visor-pdf/visor-pdf.component';
import { VisorImagenComponent } from './visor-imagen/visor-imagen.component';
import { ReproductorAudioComponent } from './reproductor-audio/reproductor-audio.component';
import { ReproductorVideoComponent } from './reproductor-video/reproductor-video.component';
import { DialogModule } from 'primeng/dialog';

export type ViewerType = 'PDF' | 'IMAGEN' | 'AUDIO' | 'VIDEO' | 'WORD' | 'OTRO' | null;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-documentos-page',
  standalone: true,
  imports: [
    CommonModule,
    DocumentosUploadComponent,
    DocumentosListComponent,
    VisorPdfComponent,
    VisorImagenComponent,
    ReproductorAudioComponent,
    ReproductorVideoComponent,
    DialogModule
  ],
  templateUrl: './documentos-page.component.html',
  styleUrls: ['./documentos-page.component.scss']
})
export class DocumentosPageComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  documentos: Documento[] = [];
  expedienteId = 0;
  loading = false;
  errorMessage = '';
  viewerType: ViewerType = null;
  viewerUrl = '';
  selectedDocumento?: Documento;

  constructor(private documentosService: DocumentosService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => Number(params.get('id'))),
      filter(id => !Number.isNaN(id) && id > 0),
      tap(id => {
        this.expedienteId = id;
        this.loading = true;
        this.errorMessage = '';
        this.cdr.markForCheck();
      }),
      switchMap(id => this.documentosService.listar(id)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (response) => {
        this.documentos = response.data ?? [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message ?? 'No se pudo cargar documentos';
        this.cdr.markForCheck();
      }
    });
  }

  cargarDocumentos(): void {
    if (!this.expedienteId) return;
    this.loading = true;
    this.errorMessage = '';
    this.documentosService.listar(this.expedienteId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.documentos = response.data ?? [];
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error?.error?.message ?? 'No se pudo cargar documentos';
          this.cdr.markForCheck();
        }
      });
  }

  onUploaded(): void {
    this.cargarDocumentos();
  }

  onVer(documento: Documento): void {
    const extension = documento.extension.toLowerCase();
    if (extension === 'avi' || extension === 'mov') {
      this.onDescargar(documento);
      return;
    }

    this.viewerType = documento.categoria as ViewerType;
    this.viewerUrl = this.documentosService.getContenidoUrl(documento.id, 'inline');
    this.selectedDocumento = documento;
  }

  onDescargar(documento: Documento): void {
    const url = this.documentosService.getContenidoUrl(documento.id, 'attachment');
    window.open(url, '_blank');
  }

  onImprimir(documento: Documento): void {
    const url = this.documentosService.getContenidoUrl(documento.id, 'inline');
    window.open(url, '_blank');
    this.documentosService.registrarImpresion(documento.id).subscribe();
  }

  onEliminar(documento: Documento): void {
    this.documentosService.eliminar(documento.id).subscribe({
      next: () => { this.cargarDocumentos(); },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'No se pudo eliminar documento';
        this.cdr.markForCheck();
      }
    });
  }

  cerrarVisor(): void {
    this.viewerType = null;
    this.viewerUrl = '';
    this.selectedDocumento = undefined;
  }
}
