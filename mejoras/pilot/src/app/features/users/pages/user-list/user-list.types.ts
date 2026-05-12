// ═══════════════════════════════════════════════════════════════
// user-list.types.ts
// Tipos centralizados del componente. Separamos API (lo que llega
// del backend) de UI (lo que consume la vista).
// ═══════════════════════════════════════════════════════════════

// ═══ Tipos del API (shape del backend) ═══

export interface UserApiResponse {
  id: number;
  full_name: string;
  email: string;
  role_id: number;
  is_active: boolean;
  created_at: string;
}

export interface UserDetailApiResponse extends UserApiResponse {
  phone: string;
  last_login: string | null;
  permissions: string[];
}

export interface RoleApiResponse {
  id: number;
  name: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
}

// ═══ Tipos del UI (shape de la vista) ═══

export interface UserRow {
  id: number;
  name: string;
  email: string;
  role: string;
  roleId: number;
  active: boolean;
}

export interface UserDetail {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
  lastLogin: string | null;
  permissions: string[];
}

export interface DropdownOption<T = number | string> {
  value: T;
  label: string;
}

export interface UserListFilters {
  search: string;
  roleId: number | null;
}

export interface ModalState {
  isOpen: boolean;
  userId: number | null;
}

// ═══ Enums ═══

export enum LoadState {
  Idle = 'idle',
  Loading = 'loading',
  Success = 'success',
  Error = 'error',
}
