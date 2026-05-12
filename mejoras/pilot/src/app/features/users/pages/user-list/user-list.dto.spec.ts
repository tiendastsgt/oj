// ═══════════════════════════════════════════════════════════════
// user-list.dto.spec.ts
// Test puro del DTO — sin TestBed, sin Angular, sin HTTP.
// Lo más fácil y rápido de testear.
// ═══════════════════════════════════════════════════════════════

import { UserListDto } from './user-list.dto';
import { UserRow, LoadState } from './user-list.types';

describe('UserListDto', () => {
  let dto: UserListDto;

  beforeEach(() => {
    dto = new UserListDto();
  });

  // ─── Estado inicial ───

  it('inicia con LoadState.Idle', () => {
    expect(dto.state()).toBe(LoadState.Idle);
    expect(dto.isLoading()).toBe(false);
    expect(dto.hasError()).toBe(false);
  });

  it('tiene mocks iniciales para que el UI funcione sin BE', () => {
    expect(dto.users().length).toBeGreaterThan(0);
    expect(dto.roleOptions().length).toBeGreaterThan(0);
  });

  // ─── Computed: filteredUsers ───

  it('filteredUsers retorna todos cuando no hay filtros', () => {
    expect(dto.filteredUsers().length).toBe(dto.users().length);
  });

  it('filteredUsers filtra por nombre (case insensitive)', () => {
    dto.filters.update(f => ({ ...f, search: 'juan' }));
    const results = dto.filteredUsers();
    expect(results.length).toBe(1);
    expect(results[0].name.toLowerCase()).toContain('juan');
  });

  it('filteredUsers filtra por email', () => {
    dto.filters.update(f => ({ ...f, search: 'ana@demo' }));
    const results = dto.filteredUsers();
    expect(results.every(u => u.email.includes('ana@demo'))).toBe(true);
  });

  it('filteredUsers filtra por rol', () => {
    dto.filters.update(f => ({ ...f, roleId: 1 })); // Admin
    const results = dto.filteredUsers();
    expect(results.every(u => u.roleId === 1)).toBe(true);
  });

  it('filteredUsers combina filtros (search + role)', () => {
    dto.filters.update(() => ({ search: 'carlos', roleId: 1 }));
    const results = dto.filteredUsers();
    expect(results.every(u => u.roleId === 1 && u.name.toLowerCase().includes('carlos'))).toBe(true);
  });

  // ─── Computed: totalPages ───

  it('totalPages calcula correctamente', () => {
    dto.totalRecords.set(25);
    dto.pageSize.set(10);
    expect(dto.totalPages()).toBe(3);
  });

  it('totalPages nunca es menor a 1', () => {
    dto.totalRecords.set(0);
    expect(dto.totalPages()).toBe(1);
  });

  // ─── Mutaciones de signals ───

  it('users.set reemplaza la lista completa', () => {
    const newUsers: UserRow[] = [
      { id: 99, name: 'Test', email: 't@t.com', role: 'Admin', roleId: 1, active: true },
    ];
    dto.users.set(newUsers);
    expect(dto.users()).toEqual(newUsers);
  });
});
