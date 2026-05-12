// ═══════════════════════════════════════════════════════════════
// user-list.dto.ts
// Estado reactivo del componente. Cada propiedad es un signal.
// Los mocks iniciales permiten que el UI funcione SIN backend.
// Los computed son derivados que se recalculan automáticamente.
// ═══════════════════════════════════════════════════════════════

import { signal, computed } from '@angular/core';
import {
  UserRow,
  UserDetail,
  DropdownOption,
  UserListFilters,
  ModalState,
  LoadState,
} from './user-list.types';

export class UserListDto {
  // ─────────────────────────────────────────────────────────────
  // Estado de carga del listado
  // ─────────────────────────────────────────────────────────────
  state = signal<LoadState>(LoadState.Idle);
  error = signal<string | null>(null);

  isLoading = computed(() => this.state() === LoadState.Loading);
  hasError  = computed(() => this.state() === LoadState.Error);

  // ─────────────────────────────────────────────────────────────
  // Datos principales — con MOCKS iniciales (UI funciona sin BE)
  // ─────────────────────────────────────────────────────────────
  users = signal<UserRow[]>([
    { id: 1, name: 'Juan Pérez',  email: 'juan@demo.com',  role: 'Admin',  roleId: 1, active: true  },
    { id: 2, name: 'Ana López',   email: 'ana@demo.com',   role: 'Editor', roleId: 2, active: true  },
    { id: 3, name: 'Luis Soto',   email: 'luis@demo.com',  role: 'Viewer', roleId: 3, active: false },
    { id: 4, name: 'María Ramos', email: 'maria@demo.com', role: 'Editor', roleId: 2, active: true  },
    { id: 5, name: 'Carlos Díaz', email: 'carlos@demo.com',role: 'Admin',  roleId: 1, active: true  },
  ]);

  // ─────────────────────────────────────────────────────────────
  // Filtros (objeto agrupado para minimizar updates)
  // ─────────────────────────────────────────────────────────────
  filters = signal<UserListFilters>({
    search: '',
    roleId: null,
  });

  // ─────────────────────────────────────────────────────────────
  // Dropdowns — con MOCKS iniciales
  // ─────────────────────────────────────────────────────────────
  roleOptions = signal<DropdownOption[]>([
    { value: '',  label: 'Todos los roles' },
    { value: 1,   label: 'Admin'           },
    { value: 2,   label: 'Editor'          },
    { value: 3,   label: 'Viewer'          },
  ]);

  // ─────────────────────────────────────────────────────────────
  // Paginación
  // ─────────────────────────────────────────────────────────────
  page         = signal(1);
  pageSize     = signal(10);
  totalRecords = signal(5);

  // ─────────────────────────────────────────────────────────────
  // Modal de detalle
  // ─────────────────────────────────────────────────────────────
  modal = signal<ModalState>({
    isOpen: false,
    userId: null,
  });

  selectedUser    = signal<UserDetail | null>(null);
  isLoadingDetail = signal(false);
  detailError     = signal<string | null>(null);

  // ─────────────────────────────────────────────────────────────
  // DERIVADOS (computed) — se recalculan solo cuando algo cambia
  // ─────────────────────────────────────────────────────────────

  /**
   * Aplica los filtros sobre la lista cargada.
   * NOTA: cuando hay backend que filtra del lado servidor,
   * este computed simplemente devuelve users() tal cual y el
   * filtrado lo hace el httpResource al cambiar los params.
   * Acá lo dejamos local para que funcione con mocks.
   */
  filteredUsers = computed(() => {
    const { search, roleId } = this.filters();
    const term = search.trim().toLowerCase();

    return this.users().filter(u => {
      const matchesSearch = !term
        || u.name.toLowerCase().includes(term)
        || u.email.toLowerCase().includes(term);
      const matchesRole = !roleId || u.roleId === roleId;
      return matchesSearch && matchesRole;
    });
  });

  hasResults  = computed(() => this.filteredUsers().length > 0);
  resultCount = computed(() => this.filteredUsers().length);

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalRecords() / this.pageSize()))
  );
}
