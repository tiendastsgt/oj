import { DestroyRef, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AncladosService } from '../../../core/services/anclados.service';
import { BusquedaExpedientesService } from '../../../core/services/busqueda-expedientes.service';
import { ExpedienteBusquedaResponse } from '../../../core/models/busqueda.model';
import { AuthUser } from '../../../core/models/auth-user.model';
import { OjShellSection, OjShellUser } from '../../../shared/components/oj-shell/oj-shell.types';
import { BusquedaContainerDto } from './busqueda-container.dto';
import { ExpedienteResultadoUI, FilterPill, FiltrosDrawerState } from './busqueda-container.types';

const NAV_CONSULTA: OjShellSection = {
  label: 'Consulta',
  items: [
    {
      label: 'Búsqueda de expedientes',
      icon: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
      route: '/busqueda'
    }
  ]
};

const NAV_ANALISIS: OjShellSection = {
  label: 'Análisis',
  items: [
    {
      label: 'Reportes',
      icon: '<svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-5"/></svg>',
      route: '/reportes'
    }
  ]
};

const NAV_ADMIN: OjShellSection = {
  label: 'Administración',
  items: [
    {
      label: 'Usuarios y roles',
      icon: '<svg viewBox="0 0 24 24"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><circle cx="17" cy="7" r="3"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/></svg>',
      route: '/admin/usuarios'
    },
    {
      label: 'Auditoría',
      icon: '<svg viewBox="0 0 24 24"><path d="M3 3h18v4H3zM3 10h18v4H3zM3 17h18v4H3z"/></svg>',
      route: '/admin/auditoria'
    }
  ]
};

const EMPTY_FILTROS: FiltrosDrawerState = {
  fechaDesde: '', fechaHasta: '',
  soloAnclados: false, soloAsignados: false, soloAudienciaProxima: false
};

@Injectable()
export class BusquedaContainerService {
  readonly dto: BusquedaContainerDto;

  constructor(
    private auth: AuthService,
    private ancladosSvc: AncladosService,
    private busquedaSvc: BusquedaExpedientesService,
    private destroyRef: DestroyRef,
    private route: ActivatedRoute
  ) {
    this.dto = new BusquedaContainerDto(this.ancladosSvc.todos);
    this.initShell();
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const numero = params['numero'];
      if (numero) {
        this.dto.query.set(numero);
        this.buscar(numero);
      }
    });
  }

  updateQuery(event: Event): void {
    this.dto.query.set((event.target as HTMLInputElement).value);
  }

  buscar(query: string): void {
    const q = query.trim();
    this.dto.query.set(q);
    if (!q) {
      this.dto.mostrandoResultados.set(false);
      this.dto.resultados.set([]);
      this.dto.filtrosAplicados.set([]);
      return;
    }
    this.dto.paginacion.update(p => ({ ...p, page: 0 }));
    this.cargarResultados(q);
  }

  cambiarPagina(page: number): void {
    this.dto.paginacion.update(p => ({ ...p, page }));
    this.cargarResultados(this.dto.query());
  }

  abrirFiltros(): void { this.dto.filtersOpen.set(true); }
  cerrarFiltros(): void { this.dto.filtersOpen.set(false); }

  aplicarFiltros(filtros: FiltrosDrawerState): void {
    this.dto.filtrosState.set(filtros);
    this.cerrarFiltros();
    this.dto.paginacion.update(p => ({ ...p, page: 0 }));
    this.cargarResultados(this.dto.query());
  }

  limpiarFiltros(): void {
    this.dto.filtrosState.set(EMPTY_FILTROS);
    this.cerrarFiltros();
    if (this.dto.query()) {
      this.cargarResultados(this.dto.query());
    }
  }

  quitarFiltro(pill: FilterPill): void {
    if (pill.id === 'query') {
      this.buscar('');
    } else {
      const filtros = { ...this.dto.filtrosState() };
      if (pill.id in filtros) {
        (filtros as Record<string, unknown>)[pill.id] = false;
      }
      this.aplicarFiltros(filtros);
    }
  }

  private cargarResultados(query: string): void {
    const pag = this.dto.paginacion();
    this.busquedaSvc
      .buscarRapida(query, { page: pag.page, size: pag.size })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: resp => {
          if (resp.data) {
            this.dto.resultados.set(resp.data.content.map(r => this.toResultadoUI(r)));
            this.dto.paginacion.update(p => ({
              ...p,
              total: resp.data!.totalElements,
              totalPages: resp.data!.totalPages
            }));
            this.dto.mostrandoResultados.set(true);
            this.actualizarPills(query);
          }
        }
      });
  }

  private actualizarPills(query: string): void {
    const pills: FilterPill[] = [];
    if (query) pills.push({ id: 'query', label: `Coincidencia: ${query}` });
    const f = this.dto.filtrosState();
    if (f.soloAnclados) pills.push({ id: 'soloAnclados', label: 'Con anclados' });
    if (f.soloAsignados) pills.push({ id: 'soloAsignados', label: 'Asignados a mí' });
    if (f.soloAudienciaProxima) pills.push({ id: 'soloAudienciaProxima', label: 'Audiencia próxima' });
    if (f.fechaDesde) pills.push({ id: 'fechaDesde', label: `Desde: ${f.fechaDesde}` });
    if (f.fechaHasta) pills.push({ id: 'fechaHasta', label: `Hasta: ${f.fechaHasta}` });
    this.dto.filtrosAplicados.set(pills);
  }

  private toResultadoUI(r: ExpedienteBusquedaResponse): ExpedienteResultadoUI {
    const tipoBaja = r.tipoProceso?.toLowerCase() ?? '';
    const tipoClass = tipoBaja.includes('adolescen') ? 'tipo-adolescentes'
      : tipoBaja.includes('ni') ? 'tipo-ninez' : '';
    const partes = [r.actorPrincipal, r.demandadoPrincipal].filter(Boolean).join(' · ');
    return {
      id: r.id ?? null,
      numero: r.numero,
      juzgado: r.juzgado,
      estado: r.estado,
      tipoProceso: r.tipoProceso,
      fechaInicio: r.fechaInicio,
      tipoClass,
      ancladosCount: this.ancladosSvc.countByExpediente(r.numero),
      partes
    };
  }

  private initShell(): void {
    const user = this.auth.getCurrentUser();
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
