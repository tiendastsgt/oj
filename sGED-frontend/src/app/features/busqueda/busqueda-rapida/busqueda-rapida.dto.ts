import { signal } from '@angular/core';
import { Page } from '../../../core/models/page.model';
import { ExpedienteBusquedaResponse } from '../../../core/models/busqueda.model';

export class BusquedaRapidaDto {
  readonly resultados = signal<Page<ExpedienteBusquedaResponse> | undefined>(undefined);
  readonly loading = signal(false);
  readonly errorMessages = signal<string[]>([]);
}
