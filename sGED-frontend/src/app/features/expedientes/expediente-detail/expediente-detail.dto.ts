import { signal, computed } from '@angular/core';
import { ExpedienteResponse } from '../../../core/models/expediente.model';
import { TipoProceso, EstadoExpediente, Juzgado } from '../../../core/models/catalogos.model';
import { Documento } from '../../documentos/models/documento.model';
import { OjShellSection, OjShellUser, OjShellBreadcrumbItem } from '../../../shared/components/oj-shell/oj-shell.types';
import { LoadState, ExpedienteTab, ExpedienteHeaderStats } from './expediente-detail.types';
import { MOCK_EXPEDIENTE_DETALLE } from '../../../core/mocks/expedientes.mock';
import { MOCK_TIPOS_PROCESO, MOCK_ESTADOS, MOCK_JUZGADOS } from '../../../core/mocks/catalogos.mock';

export class ExpedienteDetailDto {
  state     = signal<LoadState>(LoadState.Idle);
  isLoading = computed(() => this.state() === LoadState.Loading);
  hasError  = computed(() => this.state() === LoadState.Error);

  expediente   = signal<ExpedienteResponse | null>(MOCK_EXPEDIENTE_DETALLE);
  errorMessage = signal<string>('');

  tiposProceso = signal<TipoProceso[]>(MOCK_TIPOS_PROCESO);
  estados      = signal<EstadoExpediente[]>(MOCK_ESTADOS);
  juzgados     = signal<Juzgado[]>(MOCK_JUZGADOS);

  selectedDocumento = signal<Documento | null>(null);
  readingModeActive = signal<boolean>(false);

  mode         = signal<ExpedienteTab>('general');
  ancladosCount = signal<number>(0);

  shellSections = signal<OjShellSection[]>([]);
  shellUser     = signal<OjShellUser | null>(null);
  readonly breadcrumb: OjShellBreadcrumbItem[] = [
    { label: 'Consulta', route: '/busqueda' },
    { label: 'Expedientes', route: '/expedientes' },
    { label: 'Detalle' }
  ];

  readonly headerStats = computed<ExpedienteHeaderStats>(() => {
    const e = this.expediente();
    const partes = [e?.actorPrincipal, e?.demandado].filter(Boolean).join(' · ');
    return {
      fechaIngreso: e ? String(e.fechaInicio) : '',
      partes: partes || 'N/D',
      totalArchivos: e?.totalDocumentos ?? 0,
      ancladosCount: this.ancladosCount(),
    };
  });
}
