import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { DocumentosListService } from './documentos-list.service';
import { Documento } from '../../documentos/models/documento.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-documentos-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, CardModule, MessageModule, ProgressBarModule],
  providers: [DocumentosListService],
  templateUrl: './documentos-list.component.html',
  styleUrls: ['./documentos-list.component.scss'],
})
export class DocumentosListComponent {
  expedienteId = input<number>(0);
  viewDocumento = output<Documento>();

  protected svc = inject(DocumentosListService);
  protected dto = this.svc.dto;

  constructor() {
    effect(() => {
      const id = this.expedienteId();
      if (id > 0) {
        this.svc.cargarDocumentos(id);
      }
    });
  }
}
