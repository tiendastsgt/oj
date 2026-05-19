import { Injectable, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { AncladosService } from '../../core/services/anclados.service';
import { DocumentosService } from '../../core/services/documentos.service';
import { PresentacionDto } from './presentacion.dto';
import { DEMO_SAMPLE_PDFS, MOCK_PRESENTACION_DOCS, PresentacionDoc } from './presentacion.types';
import { environment } from '../../../environments/environment';

@Injectable()
export class PresentacionService {
  private readonly ancladosSvc = inject(AncladosService);
  private readonly route       = inject(ActivatedRoute);
  private readonly router      = inject(Router);
  private readonly docsSvc     = inject(DocumentosService);
  private readonly destroyRef  = inject(DestroyRef);

  readonly dto = new PresentacionDto();

  constructor() {
    const num = this.route.snapshot.paramMap.get('expedienteNum') ?? '';
    this.dto.expedienteNum.set(num);

    if (environment.useMocks) {
      const pinned = this.ancladosSvc.getByExpediente(num);
      const docs: PresentacionDoc[] = pinned.length > 0
        ? pinned.map(a => ({ id: a.id, name: a.name, type: a.type, size: a.size, category: a.category }))
        : MOCK_PRESENTACION_DOCS;
      this.dto.docs.set(docs);
      this.dto.docAssetUrls.set(docs.map((d, i) => this.resolveSampleUrl(d.name, d.type, i)));
    } else {
      const anclados = this.ancladosSvc.getByExpediente(num);
      const docs: PresentacionDoc[] = anclados.map(a => ({
        id: a.id, name: a.name, type: a.type, size: a.size, category: a.category
      }));
      this.dto.docs.set(docs);
      this.dto.docAssetUrls.set(docs.map(() => null));
      if (docs.length > 0) {
        this.precargarPdfs(docs);
      }
    }
  }

  exit(): void {
    this.router.navigate(['/expedientes', this.dto.expedienteNum()]);
  }

  private resolveSampleUrl(name: string, type: string, idx: number): string | null {
    if (type !== 'pdf' && type !== 'doc') return null;
    const byName = DEMO_SAMPLE_PDFS.find(p => p.endsWith('/' + name));
    return byName ?? DEMO_SAMPLE_PDFS[idx % DEMO_SAMPLE_PDFS.length];
  }

  private precargarPdfs(docs: PresentacionDoc[]): void {
    docs.forEach((doc, idx) => {
      if (doc.type !== 'pdf' && doc.type !== 'doc') return;
      this.docsSvc.fetchContenidoBlob(Number(doc.id))
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: result => {
            const urls = [...this.dto.docAssetUrls()];
            urls[idx] = result.url;
            this.dto.docAssetUrls.set(urls);
          },
          error: () => {
            this.dto.docFetchErrors.update(s => s.add(idx));
          }
        });
    });
  }
}
