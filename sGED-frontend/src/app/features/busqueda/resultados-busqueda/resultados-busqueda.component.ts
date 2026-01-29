import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ExpedienteBusquedaResponse } from '../../../core/models/busqueda.model';
import { Page } from '../../../core/models/page.model';

@Component({
  selector: 'app-resultados-busqueda',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, ButtonModule, MessageModule],
  templateUrl: './resultados-busqueda.component.html',
  styleUrls: ['./resultados-busqueda.component.scss']
})
export class ResultadosBusquedaComponent {
  @Input() resultados?: Page<ExpedienteBusquedaResponse>;
  @Input() loading = false;
  @Input() errorMessages: string[] = [];
  @Output() lazyLoad = new EventEmitter<TableLazyLoadEvent>();

  get totalRecords(): number {
    return this.resultados?.totalElements ?? 0;
  }

  get rows(): number {
    return this.resultados?.size ?? 10;
  }

  get first(): number {
    const page = this.resultados?.page ?? 0;
    const size = this.resultados?.size ?? 10;
    return page * size;
  }

  canNavigate(row: ExpedienteBusquedaResponse): boolean {
    return row.fuente === 'SGED' && Boolean(row.id);
  }
}
