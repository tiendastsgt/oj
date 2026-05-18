import { computed, signal, Signal } from '@angular/core';
import { AncladoExpediente } from '../../../core/models/anclado.model';
import { OjShellBreadcrumbItem, OjShellSection, OjShellUser } from '../../../shared/components/oj-shell/oj-shell.types';
import {
  ExpedienteResultadoUI, FilterPill, FiltrosDrawerState, PaginacionUI
} from './busqueda-container.types';

const EMPTY_FILTROS: FiltrosDrawerState = {
  fechaDesde: '',
  fechaHasta: '',
  soloAnclados: false,
  soloAsignados: false,
  soloAudienciaProxima: false
};

export class BusquedaContainerDto {
  readonly anclados: Signal<AncladoExpediente[]>;
  readonly totalAnclados = computed(() =>
    this.anclados().reduce((sum, exp) => sum + exp.docs.length, 0)
  );

  readonly breadcrumb: OjShellBreadcrumbItem[] = [
    { label: 'Consulta' },
    { label: 'Búsqueda de expedientes' }
  ];

  query = signal('');
  mostrandoResultados = signal(false);
  shellSections = signal<OjShellSection[]>([]);
  shellUser = signal<OjShellUser | null>(null);

  // Fase 3: resultados
  resultados = signal<ExpedienteResultadoUI[]>([]);
  filtrosAplicados = signal<FilterPill[]>([]);
  paginacion = signal<PaginacionUI>({ page: 0, total: 0, totalPages: 0, size: 10 });
  filtersOpen = signal(false);
  filtrosState = signal<FiltrosDrawerState>(EMPTY_FILTROS);

  readonly isFirstPage = computed(() => this.paginacion().page === 0);
  readonly isLastPage = computed(() => this.paginacion().page >= this.paginacion().totalPages - 1);
  readonly showingFrom = computed(() => {
    const p = this.paginacion();
    return p.total === 0 ? 0 : p.page * p.size + 1;
  });
  readonly showingTo = computed(() => {
    const p = this.paginacion();
    return Math.min((p.page + 1) * p.size, p.total);
  });
  readonly pageNumbers = computed(() => {
    const total = this.paginacion().totalPages;
    return Array.from({ length: total }, (_, i) => i);
  });

  constructor(ancladosTodos: Signal<AncladoExpediente[]>) {
    this.anclados = ancladosTodos;
  }
}
