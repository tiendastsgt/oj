import { Injectable, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AncladosService } from '../../core/services/anclados.service';
import { PresentacionDto } from './presentacion.dto';
import { MOCK_PRESENTACION_DOCS, PresentacionDoc } from './presentacion.types';
import { environment } from '../../../environments/environment';

@Injectable()
export class PresentacionService {
  private readonly ancladosSvc = inject(AncladosService);
  private readonly route       = inject(ActivatedRoute);
  private readonly router      = inject(Router);

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
    } else {
      const anclados = this.ancladosSvc.getByExpediente(num);
      this.dto.docs.set(anclados.map(a => ({
        id: a.id, name: a.name, type: a.type, size: a.size, category: a.category
      })));
    }
  }

  exit(): void {
    this.router.navigate(['/expedientes', this.dto.expedienteNum()]);
  }
}
