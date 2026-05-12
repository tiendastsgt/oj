// ═══════════════════════════════════════════════════════════════
// user-list.service.spec.ts
// Test del Service. Verifica transformaciones API → UI,
// estados de carga, mutaciones, y manejo de errores.
// ═══════════════════════════════════════════════════════════════

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { UserListService } from './user-list.service';
import { LoadState } from './user-list.types';

// NOTA: estos tests asumen environment.useMocks = false.
// En CI conviene tener un environment.test.ts con useMocks: false.

describe('UserListService', () => {
  let service: UserListService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserListService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(UserListService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ─── Acciones ───

  it('onSearch actualiza el filtro y resetea la página', () => {
    service.dto.page.set(5);
    service.onSearch('juan');

    expect(service.dto.filters().search).toBe('juan');
    expect(service.dto.page()).toBe(1);
  });

  it('onRoleChange actualiza el filtro y resetea la página', () => {
    service.dto.page.set(3);
    service.onRoleChange(2);

    expect(service.dto.filters().roleId).toBe(2);
    expect(service.dto.page()).toBe(1);
  });

  it('openModal setea isOpen=true y guarda userId', () => {
    service.openModal(42);
    expect(service.dto.modal()).toEqual({ isOpen: true, userId: 42 });
  });

  it('closeModal resetea modal y selectedUser', () => {
    service.openModal(42);
    service.closeModal();
    expect(service.dto.modal()).toEqual({ isOpen: false, userId: null });
    expect(service.dto.selectedUser()).toBeNull();
  });

  // ─── Mutaciones HTTP ───

  it('deleteUser hace DELETE y refresca el listado', async () => {
    const deletePromise = service.deleteUser(1);

    const req = httpMock.expectOne('/api/users/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({});

    await deletePromise;
    // Tras success, no debería haber error en el DTO
    expect(service.dto.error()).toBeNull();
  });

  it('deleteUser captura el error y lo refleja en dto.error', async () => {
    const deletePromise = service.deleteUser(1);

    const req = httpMock.expectOne('/api/users/1');
    req.flush('Server error', { status: 500, statusText: 'Server Error' });

    await deletePromise;
    expect(service.dto.error()).toBeTruthy();
  });
});
