import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Documento } from '../../models/documento.model';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { FileSizePipe } from '../../../../shared/pipes/file-size.pipe';

@Component({
  selector: 'app-documentos-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TableModule, ButtonModule, TooltipModule, DatePipe, EmptyStateComponent, FileSizePipe],
  templateUrl: './documentos-list.component.html',
  styleUrls: ['./documentos-list.component.scss']
})
export class DocumentosListComponent {
  readonly documentos = input<Documento[]>([]);
  readonly ver        = output<Documento>();
  readonly descargar  = output<Documento>();
  readonly imprimir   = output<Documento>();
  readonly eliminar   = output<Documento>();
}
