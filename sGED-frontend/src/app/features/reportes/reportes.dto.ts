import { computed, signal } from '@angular/core';
import { OjShellBreadcrumbItem, OjShellSection, OjShellUser } from '../../shared/components/oj-shell/oj-shell.types';
import { ReporteResultado, ReporteTipo, TipoReporteId } from './reportes.types';

const TIPOS: ReporteTipo[] = [
  {
    id: 'movimiento',
    name: 'Movimiento de expedientes',
    desc: 'Expedientes ingresados, en trámite y archivados por período'
  },
  {
    id: 'acceso',
    name: 'Acceso documental',
    desc: 'Documentos visualizados y descargados por usuario y período'
  }
];

export class ReportesDto {
  shellSections = signal<OjShellSection[]>([]);
  shellUser     = signal<OjShellUser | null>(null);

  readonly breadcrumb: OjShellBreadcrumbItem[] = [
    { label: 'Análisis' },
    { label: 'Reportes' }
  ];

  readonly tipos     = signal<ReporteTipo[]>(TIPOS);
  selectedTipo       = signal<TipoReporteId>('movimiento');
  resultado          = signal<ReporteResultado | null>(null);
  isGenerating       = signal(false);

  readonly currentTipo = computed(() => this.tipos().find(t => t.id === this.selectedTipo()) ?? null);
}
