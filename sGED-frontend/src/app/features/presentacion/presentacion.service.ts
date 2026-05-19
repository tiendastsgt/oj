import { Injectable, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { AncladosService } from '../../core/services/anclados.service';
import { DocumentosService } from '../../core/services/documentos.service';
import { PresentacionDto } from './presentacion.dto';
import { PresentacionDoc } from './presentacion.types';
import { environment } from '../../../environments/environment';

@Injectable()
export class PresentacionService {
  private readonly ancladosSvc = inject(AncladosService);
  private readonly route       = inject(ActivatedRoute);
  private readonly router      = inject(Router);
  private readonly docsSvc     = inject(DocumentosService);
  private readonly sanitizer   = inject(DomSanitizer);
  private readonly destroyRef  = inject(DestroyRef);

  readonly dto = new PresentacionDto();

  constructor() {
    const num = this.route.snapshot.paramMap.get('expedienteNum') ?? '';
    this.dto.expedienteNum.set(num);
    const anclados = this.ancladosSvc.getByExpediente(num);
    const docs: PresentacionDoc[] = anclados.map(a => ({
      id: a.id, name: a.name, type: a.type, size: a.size, category: a.category
    }));
    this.dto.docs.set(docs);
    this.dto.docBlobUrls.set(docs.map(() => null));

    if (!environment.useMocks && docs.length > 0) {
      this.precargarPdfs(docs);
    }
  }

  exit(): void {
    this.router.navigate(['/expedientes', this.dto.expedienteNum()]);
  }

  private precargarPdfs(docs: PresentacionDoc[]): void {
    docs.forEach((doc, idx) => {
      if (doc.type !== 'pdf' && doc.type !== 'doc') return;
      this.docsSvc.fetchContenidoBlob(Number(doc.id))
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: result => {
            const urls = [...this.dto.docBlobUrls()];
            urls[idx] = this.sanitizer.bypassSecurityTrustResourceUrl(result.url);
            this.dto.docBlobUrls.set(urls);
          }
        });
    });
  }
}
