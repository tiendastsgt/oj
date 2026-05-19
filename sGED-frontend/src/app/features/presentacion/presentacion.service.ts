import { Injectable, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AncladosService } from '../../core/services/anclados.service';
import { DocumentosService } from '../../core/services/documentos.service';
import { PresentacionDto } from './presentacion.dto';
import { PresentacionDoc } from './presentacion.types';
import { PdfMergerService } from './services/pdf-merger.service';

@Injectable()
export class PresentacionService {
  private readonly ancladosSvc = inject(AncladosService);
  private readonly docsSvc     = inject(DocumentosService);
  private readonly merger      = inject(PdfMergerService);
  private readonly route       = inject(ActivatedRoute);
  private readonly router      = inject(Router);
  private readonly destroyRef  = inject(DestroyRef);

  readonly dto = new PresentacionDto();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.disposeCurrentUrl());

    const num = this.route.snapshot.paramMap.get('expedienteNum') ?? '';
    this.dto.expedienteNum.set(num);

    const anclados = this.ancladosSvc.getByExpediente(num);
    const docs: PresentacionDoc[] = anclados.map(a => ({
      id: a.id, name: a.name, type: a.type, size: a.size, category: a.category
    }));
    this.dto.docs.set(docs);

    if (docs.length > 0) {
      this.rebuildMergedPdf();
    }
  }

  async rebuildMergedPdf(): Promise<void> {
    const docs = this.dto.docs();
    if (docs.length === 0) {
      this.disposeCurrentUrl();
      this.dto.mergedPdfUrl.set(null);
      this.dto.pageOffsets.set([]);
      this.dto.totalPages.set(0);
      this.dto.mergeState.set('idle');
      return;
    }
    this.dto.mergeState.set('loading');
    try {
      const result = await this.merger.merge(docs, (d) => this.fetchBytesFor(d));
      this.disposeCurrentUrl();
      this.dto.mergedPdfUrl.set(result.blobUrl);
      this.dto.pageOffsets.set(result.pageOffsets);
      this.dto.totalPages.set(result.totalPages);
      this.dto.mergeState.set('ready');
    } catch {
      this.dto.mergeError.set('No se pudo combinar los documentos');
      this.dto.mergeState.set('error');
    }
  }

  reorderDocs(from: number, to: number): void {
    const docs = [...this.dto.docs()];
    const [moved] = docs.splice(from, 1);
    docs.splice(to, 0, moved);
    this.dto.docs.set(docs);
    this.ancladosSvc.reorder(this.dto.expedienteNum(), docs.map(d => d.id));
    this.dto.activeDocIdx.set(to);
    this.rebuildMergedPdf();
  }

  scrollToDoc(idx: number): void {
    const page = this.dto.pageOffsets()[idx] ?? 0;
    this.dto.scrollTargetTick.set({ page, nonce: Date.now() });
    this.dto.activeDocIdx.set(idx);
  }

  async print(): Promise<void> {
    const url = this.dto.mergedPdfUrl();
    if (!url) return;
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    iframe.onload = () => iframe.contentWindow?.print();
    setTimeout(() => document.body.removeChild(iframe), 30000);
  }

  exit(): void {
    this.router.navigate(['/expedientes', this.dto.expedienteNum()]);
  }

  private async fetchBytesFor(doc: PresentacionDoc): Promise<{ bytes: ArrayBuffer; mime: string } | null> {
    const numId = Number(doc.id);
    if (!numId) return null;
    return firstValueFrom(this.docsSvc.fetchContenidoBytes(numId)).catch(() => null);
  }

  private disposeCurrentUrl(): void {
    const prev = this.dto.mergedPdfUrl();
    if (prev) URL.revokeObjectURL(prev);
  }
}
