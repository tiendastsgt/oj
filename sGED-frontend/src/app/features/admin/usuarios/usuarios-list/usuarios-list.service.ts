import { Injectable, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AdminUsuariosService } from '../../../../core/services/admin-usuarios.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthUser } from '../../../../core/models/auth-user.model';
import { OjShellSection, OjShellUser } from '../../../../shared/components/oj-shell/oj-shell.types';
import { UsuariosListDto } from './usuarios-list.dto';
import { LoadState, UsuarioAdminResponse, UsuarioListaFiltros } from './usuarios-list.types';

const NAV_CONSULTA: OjShellSection = {
  label: 'Consulta',
  items: [
    {
      label: 'Búsqueda de expedientes',
      icon: 'pi pi-search',
      route: '/busqueda'
    }
  ]
};

const NAV_ANALISIS: OjShellSection = {
  label: 'Análisis',
  items: [
    {
      label: 'Reportes',
      icon: 'pi pi-chart-bar',
      route: '/reportes'
    }
  ]
};

const NAV_ADMIN: OjShellSection = {
  label: 'Administración',
  items: [
    {
      label: 'Usuarios y roles',
      icon: 'pi pi-users',
      route: '/admin/usuarios'
    },
    {
      label: 'Auditoría',
      icon: 'pi pi-history',
      route: '/admin/auditoria'
    }
  ]
};

@Injectable()
export class UsuariosListService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router     = inject(Router);
  private readonly adminSvc   = inject(AdminUsuariosService);
  private readonly authSvc    = inject(AuthService);
  private readonly msgSvc     = inject(MessageService);
  private readonly confirmSvc = inject(ConfirmationService);
  private readonly fb         = inject(FormBuilder);

  readonly dto = new UsuariosListDto();

  readonly filterForm: FormGroup = this.fb.group({
    username:  [''],
    activo:    [''],
    bloqueado: ['']
  });

  constructor() {
    this.initShell();
    this.cargarUsuarios();
  }

  cargarUsuarios(page = 0): void {
    this.dto.state.set(LoadState.Loading);
    const filtros: UsuarioListaFiltros = {
      username:  this.filterForm.get('username')?.value  || undefined,
      activo:    this.filterForm.get('activo')?.value    ? this.filterForm.get('activo')?.value    === 'true' : undefined,
      bloqueado: this.filterForm.get('bloqueado')?.value ? this.filterForm.get('bloqueado')?.value === 'true' : undefined,
      page,
      size: this.dto.pageSize(),
      sort: 'id,asc'
    };

    this.adminSvc.getUsuarios(filtros)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          if (response?.data?.content) {
            this.dto.usuarios.set(response.data.content);
            this.dto.totalRecords.set(response.data.pageable?.totalElements ?? response.data.totalElements ?? 0);
            this.dto.currentPage.set(page);
          }
          this.dto.state.set(LoadState.Success);
        },
        error: (err: any) => {
          this.dto.state.set(LoadState.Error);
          this.msgSvc.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al cargar usuarios' });
        }
      });
  }

  onLazyLoad(event: any): void {
    const page = event.first ? event.first / event.rows : 0;
    this.cargarUsuarios(page);
  }

  aplicarFiltros(): void {
    this.cargarUsuarios(0);
  }

  crearNuevo(): void {
    this.router.navigate(['/admin/usuarios/nuevo']);
  }

  verDetalle(id: number): void {
    this.router.navigate(['/admin/usuarios', id]);
  }

  editar(id: number): void {
    this.router.navigate(['/admin/usuarios', id, 'editar']);
  }

  resetPassword(id: number): void {
    this.confirmSvc.confirm({
      message: '¿Resetear la contraseña del usuario?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.adminSvc.resetPassword(id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.msgSvc.add({ severity: 'success', summary: 'Éxito', detail: 'Contraseña reseteada correctamente' });
              this.cargarUsuarios(this.dto.currentPage());
            },
            error: (err: any) => {
              this.msgSvc.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al resetear contraseña' });
            }
          });
      }
    });
  }

  toggleBloqueo(usuario: UsuarioAdminResponse): void {
    const accion = usuario.bloqueado ? 'desbloquear' : 'bloquear';
    this.confirmSvc.confirm({
      message: `¿${usuario.bloqueado ? 'Desbloquear' : 'Bloquear'} el usuario ${usuario.username}?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const observable = usuario.bloqueado
          ? this.adminSvc.desbloquearUsuario(usuario.id)
          : this.adminSvc.bloquearUsuario(usuario.id);

        observable.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: () => {
            this.msgSvc.add({ severity: 'success', summary: 'Éxito', detail: `Usuario ${accion} correctamente` });
            this.cargarUsuarios(this.dto.currentPage());
          },
          error: (err: any) => {
            this.msgSvc.add({ severity: 'error', summary: 'Error', detail: err.error?.message || `Error al ${accion} usuario` });
          }
        });
      }
    });
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
