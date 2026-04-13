import { Component, OnInit, OnDestroy } from '@angular/core';
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
    <div class="card">
      <p-toolbar class="mb-4">
        <ng-template pTemplate="left">
          <h3 class="m-0">Gestión de Usuarios</h3>
        </ng-template>
        <ng-template pTemplate="right">
          <p-button
            label="Nuevo Usuario"
            icon="pi pi-plus"
            (onClick)="crearNuevo()"
            [rounded]="true"
            [raised]="true"
          ></p-button>
        </ng-template>
      </p-toolbar>

      <!-- Filtros -->
      <div class="grid mb-4" [formGroup]="filterForm">
        <div class="col-12 md:col-6 lg:col-3">
          <input
            pInputText
            type="text"
            placeholder="Buscar por username"
            formControlName="username"
            class="w-full"
            (change)="aplicarFiltros()"
          />
        </div>
        <div class="col-12 md:col-6 lg:col-3">
          <select
            pInputText
            formControlName="activo"
            class="w-full"
            (change)="aplicarFiltros()"
          >
            <option value="">Estado: Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
        <div class="col-12 md:col-6 lg:col-3">
          <select
            pInputText
            formControlName="bloqueado"
            class="w-full"
            (change)="aplicarFiltros()"
          >
            <option value="">Bloqueo: Todos</option>
            <option value="true">Bloqueados</option>
            <option value="false">Desbloqueados</option>
          </select>
        </div>
      </div>

      <!-- Tabla de usuarios -->
      <p-table
        [value]="usuarios"
        [loading]="loading"
        [paginator]="true"
        [rows]="pageSize"
        [totalRecords]="totalRecords"
        [lazy]="true"
        [globalFilterFields]="['username', 'nombreCompleto', 'email']"
        (onLazyLoad)="onLazyLoad($event)"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>Username</th>
            <th>Nombre Completo</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Juzgado</th>
            <th>Estado</th>
            <th>Bloqueo</th>
            <th>Cambiar Pass</th>
            <th>Acciones</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-usuario>
          <tr>
            <td>{{ usuario.username }}</td>
            <td>{{ usuario.nombreCompleto }}</td>
            <td>{{ usuario.email }}</td>
            <td>{{ usuario.rol }}</td>
            <td>{{ usuario.juzgado }}</td>
            <td>
              <span [class]="usuario.activo ? 'p-badge-success' : 'p-badge-danger'">
                {{ usuario.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td>
              <span [class]="usuario.bloqueado ? 'p-badge-warning' : 'p-badge-info'">
                {{ usuario.bloqueado ? 'Bloqueado' : 'Desbloqueado' }}
              </span>
            </td>
            <td>
              <span [class]="usuario.debeCambiarPassword ? 'p-badge-info' : ''">
                {{ usuario.debeCambiarPassword ? 'Sí' : 'No' }}
              </span>
            </td>
            <td>
              <p-button
                icon="pi pi-eye"
                [rounded]="true"
                [text]="true"
                [raised]="true"
                pTooltip="Ver detalles"
                (onClick)="verDetalle(usuario.id)"
              ></p-button>
              <p-button
                icon="pi pi-pencil"
                [rounded]="true"
                [text]="true"
                [raised]="true"
                pTooltip="Editar"
                (onClick)="editar(usuario.id)"
              ></p-button>
              <p-button
                icon="pi pi-lock"
                [rounded]="true"
                [text]="true"
                [raised]="true"
                severity="warning"
                pTooltip="Reset contraseña"
                (onClick)="resetPassword(usuario.id)"
                *ngIf="!usuario.bloqueado"
              ></p-button>
              <p-button
                [icon]="usuario.bloqueado ? 'pi pi-lock-open' : 'pi pi-lock'"
                [rounded]="true"
                [text]="true"
                [raised]="true"
                [severity]="usuario.bloqueado ? 'success' : 'danger'"
                [pTooltip]="usuario.bloqueado ? 'Desbloquear' : 'Bloquear'"
                (onClick)="toggleBloqueo(usuario)"
              ></p-button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="9">No hay usuarios disponibles</td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
  `,
  styles: []
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
    private fb: FormBuilder
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
          if (response.data?.content) {
            this.usuarios = response.data.content;
            this.totalRecords = response.data.pageable?.totalElements || 0;
            this.currentPage = page;
          }
          this.loading = false;
        },
        error: (err: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Error al cargar usuarios'
          });
          this.loading = false;
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
