import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
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
  styleUrls: ['./documentos-list.component.scss']
})
export class DocumentosListComponent implements OnChanges {
  @Input() expedienteId = 0;
  @Output() viewDocumento = new EventEmitter<Documento>();

  protected svc = inject(DocumentosListService);
  protected dto = this.svc.dto;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['expedienteId'] && this.expedienteId > 0) {
      this.svc.cargarDocumentos(this.expedienteId);
    }
  }
}
