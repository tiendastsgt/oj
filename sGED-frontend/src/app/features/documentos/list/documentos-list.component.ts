import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Documento } from '../models/documento.model';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { FileSizePipe } from '../../../shared/pipes/file-size.pipe';

@Component({
  selector: 'app-documentos-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TableModule, ButtonModule, TooltipModule, DatePipe, EmptyStateComponent, FileSizePipe],
  templateUrl: './documentos-list.component.html',
  styleUrls: ['./documentos-list.component.scss']
})
export class DocumentosListComponent {
  @Input() documentos: Documento[] = [];
  @Output() ver = new EventEmitter<Documento>();
  @Output() descargar = new EventEmitter<Documento>();
  @Output() imprimir = new EventEmitter<Documento>();
  @Output() eliminar = new EventEmitter<Documento>();
}
