import { Component, OnInit, OnDestroy, ChangeDetectorRef , ChangeDetectionStrategy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminUsuariosService } from '../../../../core/services/admin-usuarios.service';
import { UsuarioAdminResponse, UsuarioListaFiltros } from '../../../../core/models/admin-usuarios.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    PaginatorModule,
    ConfirmDialogModule,
    ToastModule,
    ToolbarModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="fade-in">
      <div class="page-header-actions mb-6">
        <div>
          <h1 class="page-title">Gestión de Usuarios</h1>
          <p class="subtitle">Administre los usuarios y permisos del sistema</p>
        </div>
        <button class="btn btn-primary" (click)="crearNuevo()">
          <i class="pi pi-user-plus"></i> Nuevo Usuario
        </button>
      </div>

      <div class="card glass-panel shadow-lg mb-8">
        <div class="card-header border-b border-white/5 flex flex-wrap gap-4 justify-between items-center p-6">
          <div class="flex gap-3" [formGroup]="filterForm">
            <div class="relative">
              <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
              <input
                type="text"
                class="form-input !pl-10 !w-64"
                placeholder="Buscar username..."
                formControlName="username"
                (change)="aplicarFiltros()"
              />
            </div>
            <select class="form-input form-select !w-auto" formControlName="activo" (change)="aplicarFiltros()">
              <option value="">Todos los estados</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>
          <span class="text-xs text-slate-500 font-bold uppercase tracking-wider">{{ totalRecords }} usuarios registrados</span>
        </div>

        <div class="p-0 overflow-x-auto">
          <p-table
            [value]="usuarios"
            [loading]="loading"
            [paginator]="true"
            [rows]="pageSize"
            [totalRecords]="totalRecords"
            [lazy]="true"
            (onLazyLoad)="onLazyLoad($event)"
            styleClass="p-datatable-sm"
          >
            <ng-template pTemplate="header">
              <tr>
                <th>Username</th>
                <th>Nombre Completo</th>
                <th>Rol</th>
                <th>Juzgado</th>
                <th>Estado</th>
                <th style="text-align:center">Acciones</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-usuario>
              <tr>
                <td class="font-bold text-white">{{ usuario.username }}</td>
                <td>{{ usuario.nombreCompleto }}</td>
                <td><span class="text-xs font-bold text-cyan-400 uppercase tracking-tighter">{{ usuario.rol }}</span></td>
                <td><span class="text-slate-400">{{ usuario.juzgado || 'Global' }}</span></td>
                <td>
                  <div class="flex items-center gap-2">
                    <span class="status-dot" [class.active]="usuario.activo" [class.blocked]="usuario.bloqueado"></span>
                    <span class="text-xs font-medium">{{ usuario.activo ? (usuario.bloqueado ? 'Bloqueado' : 'Activo') : 'Inactivo' }}</span>
                  </div>
                </td>
                <td>
                  <div class="flex justify-center gap-1">
                    <button class="btn-icon view" title="Ver" (click)="verDetalle(usuario.id)"><i class="pi pi-eye"></i></button>
                    <button class="btn-icon edit" title="Editar" (click)="editar(usuario.id)"><i class="pi pi-pencil"></i></button>
                    <button class="btn-icon download" title="Reset Pass" (click)="resetPassword(usuario.id)"><i class="pi pi-key"></i></button>
                    <button 
                      class="btn-icon" 
                      [class.view]="usuario.bloqueado" 
                      [class.print]="!usuario.bloqueado" 
                      [title]="usuario.bloqueado ? 'Desbloquear' : 'Bloquear'" 
                      (click)="toggleBloqueo(usuario)"
                    >
                      <i class="pi" [ngClass]="usuario.bloqueado ? 'pi-lock-open' : 'pi-lock'"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="6" class="p-12 text-center text-slate-500">No hay usuarios que coincidan con los criterios</td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>
    </div>

    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
  `,
  styles: [`
    .status-dot {
      width: 8px; height: 8px; border-radius: 50%;
      &.active { background: var(--accent-emerald); box-shadow: 0 0 8px var(--accent-emerald); }
      &.blocked { background: var(--accent-rose); box-shadow: 0 0 8px var(--accent-rose); }
    }
    ::ng-deep {
      .p-datatable { background: transparent !important; }
      .p-paginator { background: transparent !important; border-top: 1px solid var(--border) !important; padding: 1rem !important; }
    }
  `]
})
export class UsuariosListComponent implements OnInit, OnDestroy {
  usuarios: UsuarioAdminResponse[] = [];
  loading = false;
  pageSize = 20;
  totalRecords = 0;
  currentPage = 0;
  filterForm: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private adminUsuariosService: AdminUsuariosService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.filterForm = this.fb.group({
      username: [''],
      activo: [''],
      bloqueado: ['']
    });
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarUsuarios(page = 0): void {
    this.loading = true;
    const filtros: UsuarioListaFiltros = {
      username: this.filterForm.get('username')?.value || undefined,
      activo: this.filterForm.get('activo')?.value ? this.filterForm.get('activo')?.value === 'true' : undefined,
      bloqueado: this.filterForm.get('bloqueado')?.value ? this.filterForm.get('bloqueado')?.value === 'true' : undefined,
      page,
      size: this.pageSize,
      sort: 'id,asc'
    };

    this.adminUsuariosService
      .getUsuarios(filtros)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          setTimeout(() => {
            if (response?.data?.content) {
              this.usuarios = response.data.content;
              this.totalRecords = response.data.pageable?.totalElements || response.data.totalElements || 0;
              this.currentPage = page;
            }
            this.loading = false;
            this.cdr.detectChanges();
          });
        },
        error: (err: any) => {
          setTimeout(() => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error?.message || 'Error al cargar usuarios'
            });
            this.loading = false;
          });
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
    this.confirmationService.confirm({
      message: '¿Resetear la contraseña del usuario?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.adminUsuariosService
          .resetPassword(id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Contraseña reseteada correctamente'
              });
              this.cargarUsuarios(this.currentPage);
            },
            error: (err: any) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: err.error?.message || 'Error al resetear contraseña'
              });
            }
          });
      }
    });
  }

  toggleBloqueo(usuario: UsuarioAdminResponse): void {
    const accion = usuario.bloqueado ? 'desbloquear' : 'bloquear';
    const metodo = usuario.bloqueado ? 'desbloquearUsuario' : 'bloquearUsuario';

    this.confirmationService.confirm({
      message: `¿${accion === 'desbloquear' ? 'Desbloquear' : 'Bloquear'} el usuario ${usuario.username}?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const observable = usuario.bloqueado
          ? this.adminUsuariosService.desbloquearUsuario(usuario.id)
          : this.adminUsuariosService.bloquearUsuario(usuario.id);

        observable.pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: `Usuario ${accion} correctamente`
            });
            this.cargarUsuarios(this.currentPage);
          },
          error: (err: any) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error?.message || `Error al ${accion} usuario`
            });
          }
        });
      }
    });
  }
}
