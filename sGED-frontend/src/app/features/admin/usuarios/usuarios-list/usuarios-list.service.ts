import { Injectable, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AdminUsuariosService } from '../../../../core/services/admin-usuarios.service';
import { UsuariosListDto } from './usuarios-list.dto';
import { LoadState, UsuarioAdminResponse, UsuarioListaFiltros } from './usuarios-list.types';

@Injectable()
export class UsuariosListService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router     = inject(Router);
  private readonly adminSvc   = inject(AdminUsuariosService);
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
}
