import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ExpedienteBusquedaResponse, Page } from './resultados-busqueda.types';
import { ResultadosBusquedaDto } from './resultados-busqueda.dto';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-resultados-busqueda',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, ButtonModule, MessageModule],
  templateUrl: './resultados-busqueda.component.html',
  styleUrls: ['./resultados-busqueda.component.scss']
})
export class ResultadosBusquedaComponent {
  resultados    = input<Page<ExpedienteBusquedaResponse>>();
  loading       = input(false);
  errorMessages = input<string[]>([]);
  lazyLoad      = output<TableLazyLoadEvent>();

  protected dto = new ResultadosBusquedaDto(this.resultados);

  canNavigate(row: ExpedienteBusquedaResponse): boolean {
    return row.fuente === 'SGED' && Boolean(row.id);
  }
}
