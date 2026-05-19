import { signal } from '@angular/core';
import { Page } from '../../../core/models/page.model';
import { ExpedienteBusquedaResponse } from '../../../core/models/busqueda.model';
import { MOCK_RESULTADOS_BUSQUEDA } from '../../../core/mocks/busqueda.mock';

export class BusquedaRapidaDto {
  readonly resultados    = signal<Page<ExpedienteBusquedaResponse> | undefined>(MOCK_RESULTADOS_BUSQUEDA);
  readonly loading       = signal(false);
  readonly errorMessages = signal<string[]>([]);
}
