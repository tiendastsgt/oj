import {
  ChangeDetectionStrategy, Component, DestroyRef, HostListener, Input, OnChanges,
  SimpleChanges, computed, inject, signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpEventType } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { concat } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DocumentosService } from '../../../../../core/services/documentos.service';
import { AncladosService } from '../../../../../core/services/anclados.service';
import { AncladoDoc } from '../../../../../core/models/anclado.model';
import { Documento } from '../../../../documentos/models/documento.model';
import { DocumentoViewerComponent } from '../../../documento-viewer/documento-viewer.component';

type TipoFiltro = 'todos' | 'doc' | 'video' | 'audio' | 'img';

function tipoDeDoc(doc: Documento): TipoFiltro {
  const ext = doc.extension?.toLowerCase() ?? '';
  if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) return 'video';
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return 'audio';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'img';
  return 'doc';
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-exp-archivos',
  standalone: true,
  imports: [CommonModule, ToastModule, DocumentoViewerComponent],
  providers: [MessageService],
  templateUrl: './exp-archivos.component.html',
  styleUrls: ['./exp-archivos.component.scss']
})
export class ExpArchivosComponent implements OnChanges {
  @Input({ required: true }) expedienteId!: number;
  @Input({ required: true }) expedienteNumero!: string;

  private readonly docsSvc       = inject(DocumentosService);
  private readonly ancladosSvc   = inject(AncladosService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef    = inject(DestroyRef);

  protected readonly isDragging  = signal(false);

  protected readonly documentos  = signal<Documento[]>([]);
  protected readonly loading     = signal(false);
  protected readonly tipoFiltro  = signal<TipoFiltro>('todos');
  protected readonly busqueda    = signal('');
  protected readonly soloAnclados = signal(false);
  protected readonly selectedDoc = signal<Documento | null>(null);

  protected readonly docsVista = computed(() => {
    const tipo   = this.tipoFiltro();
    const q      = this.busqueda().toLowerCase();
    const soloP  = this.soloAnclados();
    const anclados = this.ancladosSvc.getByExpediente(this.expedienteNumero ?? '');
    const ancladoIds = new Set(anclados.map(a => a.id));

    return this.documentos().filter(d => {
      if (tipo !== 'todos' && tipoDeDoc(d) !== tipo) return false;
      if (q && !d.nombreOriginal.toLowerCase().includes(q)) return false;
      if (soloP && !ancladoIds.has(String(d.id))) return false;
      return true;
    });
  });

  protected readonly ancladosCount = computed(() =>
    this.ancladosSvc.countByExpediente(this.expedienteNumero ?? '')
  );

  protected readonly countByTipo = computed(() => {
    const docs = this.documentos();
    return {
      todos: docs.length,
      doc:   docs.filter(d => tipoDeDoc(d) === 'doc').length,
      video: docs.filter(d => tipoDeDoc(d) === 'video').length,
      audio: docs.filter(d => tipoDeDoc(d) === 'audio').length,
      img:   docs.filter(d => tipoDeDoc(d) === 'img').length,
    };
  });

  @HostListener('window:dragenter', ['$event'])
  onDragEnter(event: DragEvent): void {
    if (!event.dataTransfer?.types.includes('Files')) return;
    event.preventDefault();
    this.isDragging.set(true);
  }

  @HostListener('window:dragleave', ['$event'])
  onDragLeave(event: DragEvent): void {
    if (event.relatedTarget !== null) return;
    this.isDragging.set(false);
  }

  @HostListener('window:dragover', ['$event'])
  onDragOver(event: DragEvent): void {
    if (!event.dataTransfer?.types.includes('Files')) return;
    event.preventDefault();
  }

  @HostListener('window:drop', ['$event'])
  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const files = event.dataTransfer?.files;
    if (files?.length) this.subirArchivos(files);
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    this.isDragging.set(false);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['expedienteId'] && this.expedienteId > 0) {
      this.cargarDocumentos();
    }
  }

  protected selectDoc(doc: Documento): void {
    this.selectedDoc.set(doc);
  }

  protected closeViewer(): void {
    this.selectedDoc.set(null);
  }

  protected setTipo(tipo: TipoFiltro): void {
    this.tipoFiltro.set(tipo);
  }

  protected updateBusqueda(event: Event): void {
    this.busqueda.set((event.target as HTMLInputElement).value);
  }

  protected toggleSoloAnclados(): void {
    this.soloAnclados.update(v => !v);
  }

  protected togglePin(doc: Documento, event: Event): void {
    event.stopPropagation();
    const ancladoDoc: AncladoDoc = {
      id: String(doc.id),
      name: doc.nombreOriginal,
      type: this.toAncladoType(tipoDeDoc(doc)),
      size: String(doc.tamanio),
      category: doc.categoria
    };
    this.ancladosSvc.toggle(this.expedienteNumero, ancladoDoc, this.expedienteId);
  }

  protected isAnclado(doc: Documento): boolean {
    return this.ancladosSvc.getByExpediente(this.expedienteNumero ?? '').some(a => a.id === String(doc.id));
  }

  protected getTipoIcon(doc: Documento): string {
    return tipoDeDoc(doc);
  }

  protected formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  private subirArchivos(files: FileList): void {
    const fileList = Array.from(files);
    const uploads$ = fileList.map(file =>
      this.docsSvc.uploadDocumento(this.expedienteId, file).pipe(
        filter(ev => ev.type === HttpEventType.Response)
      )
    );

    concat(...uploads$)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        complete: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Archivos subidos',
            detail: `${fileList.length} archivo(s) subido(s) correctamente.`,
            life: 4000
          });
          this.cargarDocumentos();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error de subida',
            detail: 'No se pudo subir uno o más archivos.',
            life: 5000
          });
        }
      });
  }

  private cargarDocumentos(): void {
    this.loading.set(true);
    this.docsSvc.getDocumentos(this.expedienteId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => { this.documentos.set(res.data ?? []); this.loading.set(false); },
        error: ()  => { this.loading.set(false); }
      });
  }

  private toAncladoType(tipo: TipoFiltro): AncladoDoc['type'] {
    if (tipo === 'video') return 'video';
    if (tipo === 'audio') return 'audio';
    if (tipo === 'img')   return 'img';
    return 'pdf';
  }
}
