import { Injectable, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AncladosService } from '../../core/services/anclados.service';
import { PresentacionDto } from './presentacion.dto';
import { PresentacionDoc } from './presentacion.types';

@Injectable()
export class PresentacionService {
  private readonly ancladosSvc = inject(AncladosService);
  private readonly route       = inject(ActivatedRoute);
  private readonly router      = inject(Router);

  readonly dto = new PresentacionDto();

  constructor() {
    const num = this.route.snapshot.paramMap.get('expedienteNum') ?? '';
    this.dto.expedienteNum.set(num);
    const anclados = this.ancladosSvc.getByExpediente(num);
    const docs: PresentacionDoc[] = anclados.map(a => ({
      id: a.id, name: a.name, type: a.type, size: a.size, category: a.category
    }));
    this.dto.docs.set(docs);
  }

  next(): void {
    if (!this.dto.isLast()) this.dto.currentIdx.update(i => i + 1);
  }

  prev(): void {
    if (!this.dto.isFirst()) this.dto.currentIdx.update(i => i - 1);
  }

  goto(idx: number): void {
    this.dto.currentIdx.set(idx);
  }

  exit(): void {
    this.router.navigate(['/expedientes', this.dto.expedienteNum()]);
  }
}
