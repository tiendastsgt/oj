import { computed, signal, Signal } from '@angular/core';
import { AncladoExpediente } from '../../../core/models/anclado.model';
import { OjShellBreadcrumbItem, OjShellSection, OjShellUser } from '../../../shared/components/oj-shell/oj-shell.types';

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

  constructor(ancladosTodos: Signal<AncladoExpediente[]>) {
    this.anclados = ancladosTodos;
  }
}
