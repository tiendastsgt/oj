import { Injectable } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { AncladosService } from '../../../core/services/anclados.service';
import { AuthUser } from '../../../core/models/auth-user.model';
import { OjShellSection, OjShellUser } from '../../../shared/components/oj-shell/oj-shell.types';
import { BusquedaContainerDto } from './busqueda-container.dto';

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

@Injectable()
export class BusquedaContainerService {
  readonly dto: BusquedaContainerDto;

  constructor(private auth: AuthService, private ancladosSvc: AncladosService) {
    this.dto = new BusquedaContainerDto(this.ancladosSvc.todos);
    this.initShell();
  }

  updateQuery(event: Event): void {
    this.dto.query.set((event.target as HTMLInputElement).value);
  }

  buscar(query: string): void {
    const q = query.trim();
    this.dto.query.set(q);
    this.dto.mostrandoResultados.set(q.length > 0);
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
    if (user.rol === 'ADMINISTRADOR') {
      sections.push(NAV_ADMIN);
    }
    return sections;
  }
}
