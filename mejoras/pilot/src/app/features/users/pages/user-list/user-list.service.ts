// ═══════════════════════════════════════════════════════════════
// user-list.service.ts
// Toda la lógica del componente:
//   - httpResource para GET reactivos (se re-ejecutan cuando
//     cambian los signals de los que dependen)
//   - HttpClient + firstValueFrom para mutaciones (POST/PUT/DELETE)
//   - effect() para sincronizar resources con el DTO
//   - Transformaciones API → UI antes de guardar en el DTO
// ═══════════════════════════════════════════════════════════════

import { Injectable, inject, effect } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { formatError } from '../../../../core/utils/error';

import { UserListDto } from './user-list.dto';
import {
  LoadState,
  PaginatedResponse,
  UserApiResponse,
  UserDetailApiResponse,
  UserDetail,
  UserRow,
  RoleApiResponse,
} from './user-list.types';

@Injectable()
export class UserListService {
  private http = inject(HttpClient);

  /** DTO público — el componente lo expone al template */
  public dto = new UserListDto();

  // ─────────────────────────────────────────────────────────────
  // GET reactivos con httpResource
  // ─────────────────────────────────────────────────────────────

  /**
   * Listado de usuarios. Se re-ejecuta automáticamente cuando
   * cambia cualquier signal del que depende (filters, page).
   * Retornar undefined detiene el resource (útil en modo mock).
   */
  private usersResource = httpResource<PaginatedResponse<UserApiResponse>>(() => {
    if (environment.useMocks) return undefined;

    const { search, roleId } = this.dto.filters();
    return {
      url: '/api/users',
      params: {
        ...(search   && { q: search }),
        ...(roleId   && { role: String(roleId) }),
        page:      String(this.dto.page()),
        page_size: String(this.dto.pageSize()),
      },
    };
  });

  /** Catálogo de roles (no depende de nada, se carga una vez). */
  private rolesResource = httpResource<RoleApiResponse[]>(() => {
    if (environment.useMocks) return undefined;
    return '/api/roles';
  });

  /**
   * Detalle de usuario — depende del userId del modal.
   * Cuando el modal se cierra (userId=null), retorna undefined
   * y el resource queda en idle.
   */
  private detailResource = httpResource<UserDetailApiResponse>(() => {
    if (environment.useMocks) return undefined;
    const userId = this.dto.modal().userId;
    return userId ? `/api/users/${userId}` : undefined;
  });

  // ─────────────────────────────────────────────────────────────
  // Constructor — registra los effects que sincronizan resources
  // con el DTO (incluye la transformación API → UI)
  // ─────────────────────────────────────────────────────────────
  constructor() {
    this.bindUsersResource();
    this.bindRolesResource();
    this.bindDetailResource();
  }

  // ─────────────────────────────────────────────────────────────
  // ACCIONES desde el View
  // ─────────────────────────────────────────────────────────────

  onSearch(term: string): void {
    this.dto.filters.update(f => ({ ...f, search: term }));
    this.dto.page.set(1); // resetea paginación
  }

  onRoleChange(roleId: number | null): void {
    this.dto.filters.update(f => ({ ...f, roleId }));
    this.dto.page.set(1);
  }

  goToPage(page: number): void {
    this.dto.page.set(page);
  }

  openModal(userId: number): void {
    this.dto.modal.set({ isOpen: true, userId });
    // El detailResource detecta el cambio y dispara el GET automáticamente
  }

  closeModal(): void {
    this.dto.modal.set({ isOpen: false, userId: null });
    this.dto.selectedUser.set(null);
    this.dto.detailError.set(null);
  }

  reload(): void {
    this.usersResource.reload();
  }

  // ─────────────────────────────────────────────────────────────
  // MUTACIONES (POST/PUT/DELETE) — usan HttpClient directo
  // ─────────────────────────────────────────────────────────────

  async deleteUser(id: number): Promise<void> {
    if (environment.useMocks) {
      // Mock: borra del array local
      this.dto.users.update(list => list.filter(u => u.id !== id));
      return;
    }

    try {
      await firstValueFrom(this.http.delete(`/api/users/${id}`));
      this.usersResource.reload();
    } catch (err) {
      this.dto.error.set(formatError(err));
    }
  }

  async toggleActive(id: number): Promise<void> {
    const user = this.dto.users().find(u => u.id === id);
    if (!user) return;

    const newActive = !user.active;

    if (environment.useMocks) {
      this.dto.users.update(list =>
        list.map(u => u.id === id ? { ...u, active: newActive } : u)
      );
      return;
    }

    try {
      await firstValueFrom(
        this.http.patch(`/api/users/${id}`, { is_active: newActive })
      );
      this.usersResource.reload();
    } catch (err) {
      this.dto.error.set(formatError(err));
    }
  }

  // ─────────────────────────────────────────────────────────────
  // SINCRONIZACIÓN de resources con el DTO (effects)
  // ─────────────────────────────────────────────────────────────

  private bindUsersResource(): void {
    effect(() => {
      const status = this.usersResource.status();

      if (status === 'loading') {
        this.dto.state.set(LoadState.Loading);
        return;
      }

      if (status === 'error') {
        this.dto.state.set(LoadState.Error);
        this.dto.error.set(formatError(this.usersResource.error()));
        return;
      }

      if (status === 'resolved') {
        const res = this.usersResource.value();
        if (!res) return;

        this.dto.users.set(res.data.map(u => this.toUserRow(u)));
        this.dto.totalRecords.set(res.total);
        this.dto.state.set(LoadState.Success);
        this.dto.error.set(null);
      }
    });
  }

  private bindRolesResource(): void {
    effect(() => {
      if (this.rolesResource.status() !== 'resolved') return;
      const data = this.rolesResource.value();
      if (!data) return;

      this.dto.roleOptions.set([
        { value: '', label: 'Todos los roles' },
        ...data.map(r => ({ value: r.id, label: r.name })),
      ]);
    });
  }

  private bindDetailResource(): void {
    effect(() => {
      const status = this.detailResource.status();

      this.dto.isLoadingDetail.set(status === 'loading');

      if (status === 'error') {
        this.dto.detailError.set(formatError(this.detailResource.error()));
        this.dto.selectedUser.set(null);
        return;
      }

      if (status === 'resolved') {
        const data = this.detailResource.value();
        if (data) {
          this.dto.selectedUser.set(this.toUserDetail(data));
          this.dto.detailError.set(null);
        }
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // TRANSFORMACIONES (API → UI)
  // Aislamos el shape del backend del shape de la vista.
  // ─────────────────────────────────────────────────────────────

  private toUserRow(api: UserApiResponse): UserRow {
    return {
      id:     api.id,
      name:   api.full_name,
      email:  api.email,
      role:   this.getRoleLabel(api.role_id),
      roleId: api.role_id,
      active: api.is_active,
    };
  }

  private toUserDetail(api: UserDetailApiResponse): UserDetail {
    return {
      id:          api.id,
      name:        api.full_name,
      email:       api.email,
      phone:       api.phone,
      role:        this.getRoleLabel(api.role_id),
      active:      api.is_active,
      lastLogin:   api.last_login,
      permissions: api.permissions,
    };
  }

  private getRoleLabel(roleId: number): string {
    return this.dto.roleOptions().find(r => r.value === roleId)?.label ?? '—';
  }
}
