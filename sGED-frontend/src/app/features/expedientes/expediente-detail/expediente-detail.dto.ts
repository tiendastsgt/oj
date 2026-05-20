import { signal, computed } from '@angular/core';
import { ExpedienteResponse } from '../../../core/models/expediente.model';
import { TipoProceso, EstadoExpediente, Juzgado } from '../../../core/models/catalogos.model';
import { Documento } from '../../documentos/models/documento.model';
import { OjShellSection, OjShellUser, OjShellBreadcrumbItem } from '../../../shared/components/oj-shell/oj-shell.types';
import { LoadState, ExpedienteTab, ExpedienteHeaderStats, DocumentCountByTipo } from './expediente-detail.types';
export class ExpedienteDetailDto {
  state     = signal<LoadState>(LoadState.Idle);
  isLoading = computed(() => this.state() === LoadState.Loading);
  hasError  = computed(() => this.state() === LoadState.Error);

  expediente   = signal<ExpedienteResponse | null>(null);
  errorMessage = signal<string>('');

  tiposProceso = signal<TipoProceso[]>([]);
  estados      = signal<EstadoExpediente[]>([]);
  juzgados     = signal<Juzgado[]>([]);

  selectedDocumento = signal<Documento | null>(null);
  readingModeActive = signal<boolean>(false);
  documentos        = signal<Documento[]>([]);

  readonly countByTipo = computed<DocumentCountByTipo>(() => {
    const docs = this.documentos();
    const ext = (d: Documento) => d.extension?.toLowerCase() ?? '';
    return {
      doc:   docs.filter(d => !['mp4','webm','mov','avi','mp3','wav','ogg','m4a','jpg','jpeg','png','gif','webp'].includes(ext(d))).length,
      video: docs.filter(d => ['mp4','webm','mov','avi'].includes(ext(d))).length,
      audio: docs.filter(d => ['mp3','wav','ogg','m4a'].includes(ext(d))).length,
      img:   docs.filter(d => ['jpg','jpeg','png','gif','webp'].includes(ext(d))).length,
    };
  });

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
