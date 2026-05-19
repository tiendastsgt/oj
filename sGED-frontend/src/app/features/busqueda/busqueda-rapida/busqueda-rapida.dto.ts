import { signal } from '@angular/core';
import { Page } from '../../../core/models/page.model';
import { ExpedienteBusquedaResponse } from '../../../core/models/busqueda.model';

const MOCK_RESULTADOS_BUSQUEDA: Page<ExpedienteBusquedaResponse> = {
  content: [
    {
      id: 1,
      numero: '01173-2026-00045',
      juzgado: 'Juzgado General de Pruebas',
      estado: 'ACTIVO',
      tipoProceso: 'Civil',
      fechaInicio: '2026-04-19',
      fuente: 'SGED',
      actorPrincipal: 'María García López',
      demandadoPrincipal: 'Construcciones Rápidas S.A.',
    },
    {
      id: 2,
      numero: '01108-2026-01234',
      juzgado: 'Juzgado General de Pruebas',
      estado: 'ACTIVO',
      tipoProceso: 'Penal',
      fechaInicio: '2026-04-10',
      fuente: 'SGED',
      actorPrincipal: 'Ministerio Público',
      demandadoPrincipal: 'Carlos Rodríguez Estrada',
    },
    {
      id: 3,
      numero: '01024-2026-00088',
      juzgado: 'Juzgado General de Pruebas',
      estado: 'ACTIVO',
      tipoProceso: 'Laboral',
      fechaInicio: '2026-04-05',
      fuente: 'SGED',
      actorPrincipal: 'Ana Lucía Pérez Morales',
      demandadoPrincipal: 'Empresa Textil Guatemala S.A.',
    },
  ],
  totalElements: 3,
  totalPages: 1,
  page: 0,
  size: 10,
};

export class BusquedaRapidaDto {
  readonly resultados    = signal<Page<ExpedienteBusquedaResponse> | undefined>(MOCK_RESULTADOS_BUSQUEDA);
  readonly loading       = signal(false);
  readonly errorMessages = signal<string[]>([]);
}
