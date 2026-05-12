import { Injectable, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AdminUsuariosService } from '../../../../core/services/admin-usuarios.service';
import { UsuarioDetailDto } from './usuario-detail.dto';
import { LoadState } from './usuario-detail.types';

@Injectable()
export class UsuarioDetailService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route      = inject(ActivatedRoute);
  private readonly router     = inject(Router);
  private readonly adminSvc   = inject(AdminUsuariosService);
  private readonly msgSvc     = inject(MessageService);

  readonly dto = new UsuarioDetailDto();

  constructor() {
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        if (params['id']) {
          this.dto.usuarioId.set(+params['id']);
          this.cargarUsuario();
        }
      });
  }

  cargarUsuario(): void {
    const id = this.dto.usuarioId();
    if (!id) return;
    this.dto.state.set(LoadState.Loading);

    this.adminSvc.getUsuario(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.dto.usuario.set(response.data ?? null);
          this.dto.state.set(LoadState.Success);
        },
        error: (err: any) => {
          this.dto.state.set(LoadState.Error);
          this.dto.errorMessage.set(err?.error?.message || 'Error al cargar usuario');
          this.msgSvc.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Error al cargar usuario' });
        }
      });
  }

  editar(): void {
    const id = this.dto.usuarioId();
    if (id) this.router.navigate(['/admin/usuarios', id, 'editar']);
  }

  volver(): void {
    this.router.navigate(['/admin/usuarios']);
  }
}
