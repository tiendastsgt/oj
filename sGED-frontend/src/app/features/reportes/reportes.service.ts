import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { AuthUser } from '../../core/models/auth-user.model';
import { OjShellSection, OjShellUser } from '../../shared/components/oj-shell/oj-shell.types';
import { ReportesDto } from './reportes.dto';
import { ReporteFilaDespacho, ReporteKpi, ReporteResultado, TipoReporteId } from './reportes.types';

const NAV_CONSULTA: OjShellSection = {
  label: 'Consulta',
  items: [
    { label: 'Búsqueda de expedientes', icon: 'pi pi-search', route: '/busqueda' }
  ]
};
const NAV_ANALISIS: OjShellSection = {
  label: 'Análisis',
  items: [
    { label: 'Reportes', icon: 'pi pi-chart-bar', route: '/reportes' }
  ]
};
const NAV_ADMIN: OjShellSection = {
  label: 'Administración',
  items: [
    { label: 'Auditoría', icon: 'pi pi-history', route: '/admin/auditoria' }
  ]
};

const MOCK_MOVIMIENTO: Omit<ReporteResultado, 'generadoPor' | 'fecha' | 'periodo'> = {
  titulo: 'Movimiento de Expedientes',
  kpis: [
    { label: 'Ingresados',  value: 87,  color: 'azul' },
    { label: 'En trámite', value: 142, color: 'dorado' },
    { label: 'Resueltos',  value: 38,  color: 'verde' },
    { label: 'Archivados', value: 29,  color: 'piedra' }
  ],
  filas: [
    { despacho: 'Juzgado 1° Adolescentes',          ingresados: 32, enTramite: 54, resueltos: 14, archivados: 11 },
    { despacho: 'Juzgado 2° Niñez y Adolescencia',  ingresados: 28, enTramite: 47, resueltos: 12, archivados: 9  },
    { despacho: 'Juzgado 3° Niñez y Adolescencia',  ingresados: 27, enTramite: 41, resueltos: 12, archivados: 9  }
  ]
};

const MOCK_ACCESO: Omit<ReporteResultado, 'generadoPor' | 'fecha' | 'periodo'> = {
  titulo: 'Acceso Documental',
  kpis: [
    { label: 'Visualizados',  value: 312, color: 'azul' },
    { label: 'Descargados',   value: 87,  color: 'dorado' },
    { label: 'Documentos únicos', value: 164, color: 'verde' },
    { label: 'Usuarios activos',  value: 18,  color: 'piedra' }
  ],
  filas: [
    { despacho: 'Juzgado 1° Adolescentes',         ingresados: 124, enTramite: 36, resueltos: 58, archivados: 22 },
    { despacho: 'Juzgado 2° Niñez y Adolescencia', ingresados: 98,  enTramite: 28, resueltos: 44, archivados: 17 },
    { despacho: 'Juzgado 3° Niñez y Adolescencia', ingresados: 90,  enTramite: 23, resueltos: 62, archivados: 12 }
  ]
};

@Injectable()
export class ReportesService {
  private readonly authSvc = inject(AuthService);
  private readonly fb      = inject(FormBuilder);

  readonly dto = new ReportesDto();

  readonly configForm: FormGroup = this.fb.group({
    fechaDesde:  ['2024-04-01'],
    fechaHasta:  ['2024-04-30'],
    tipoJuzgado: [''],
    despacho:    [''],
    estado:      [''],
    agruparPor:  ['despacho']
  });

  constructor() {
    this.initShell();
    this.generar();
  }

  selectTipo(id: TipoReporteId): void {
    this.dto.selectedTipo.set(id);
    this.generar();
  }

  generar(): void {
    this.dto.isGenerating.set(true);
    const tipo = this.dto.selectedTipo();
    const user = this.authSvc.getCurrentUser();
    const desde = this.configForm.get('fechaDesde')?.value ?? '';
    const hasta  = this.configForm.get('fechaHasta')?.value ?? '';
    const mock = tipo === 'acceso' ? MOCK_ACCESO : MOCK_MOVIMIENTO;

    const result: ReporteResultado = {
      ...mock,
      generadoPor: user ? `${user.nombreCompleto} · ${user.rol}` : 'Sistema',
      fecha: new Date(),
      periodo: `${desde} al ${hasta}`
    };

    this.dto.resultado.set(result);
    this.dto.isGenerating.set(false);
  }

  totalFila(fila: ReporteFilaDespacho): number {
    return fila.ingresados + fila.enTramite + fila.resueltos + fila.archivados;
  }

  private initShell(): void {
    const user = this.authSvc.getCurrentUser();
    if (user) {
      this.dto.shellUser.set(this.toShellUser(user));
      this.dto.shellSections.set(this.buildSections(user));
    }
  }

  private toShellUser(user: AuthUser): OjShellUser {
    const parts = user.nombreCompleto.trim().split(' ');
    const initials = parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : user.nombreCompleto.slice(0, 2).toUpperCase();
    return { name: user.nombreCompleto, role: user.rol, initials };
  }

  private buildSections(user: AuthUser): OjShellSection[] {
    const sections: OjShellSection[] = [NAV_CONSULTA, NAV_ANALISIS];
    if (user.rol === 'ADMINISTRADOR') sections.push(NAV_ADMIN);
    return sections;
  }
}
