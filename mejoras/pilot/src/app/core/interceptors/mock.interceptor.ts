// ═══════════════════════════════════════════════════════════════
// core/interceptors/mock.interceptor.ts
// Sirve respuestas mock cuando environment.useMocks = true.
// Permite trabajar sin backend.
//
// En este piloto NO se usa (porque los Services ya cortocircuitan
// las requests cuando useMocks=true y conservan los mocks del DTO).
// Lo dejamos aquí como referencia de la "Opción B" del documento.
// ═══════════════════════════════════════════════════════════════

import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, delay } from 'rxjs';
import { environment } from '../../../environments/environment';

const MOCK_USERS = [
  { id: 1, full_name: 'Juan Pérez',  email: 'juan@demo.com',  role_id: 1, is_active: true,  created_at: '2024-01-15' },
  { id: 2, full_name: 'Ana López',   email: 'ana@demo.com',   role_id: 2, is_active: true,  created_at: '2024-02-20' },
  { id: 3, full_name: 'Luis Soto',   email: 'luis@demo.com',  role_id: 3, is_active: false, created_at: '2024-03-10' },
];

const MOCK_ROLES = [
  { id: 1, name: 'Admin'  },
  { id: 2, name: 'Editor' },
  { id: 3, name: 'Viewer' },
];

export const mockInterceptor: HttpInterceptorFn = (req, next) => {
  if (!environment.useMocks) return next(req);

  // GET /api/users
  if (req.method === 'GET' && req.url.endsWith('/api/users')) {
    return of(new HttpResponse({
      status: 200,
      body: {
        data: MOCK_USERS,
        total: MOCK_USERS.length,
        page: 1,
        page_size: 10,
      },
    })).pipe(delay(300));
  }

  // GET /api/roles
  if (req.method === 'GET' && req.url.endsWith('/api/roles')) {
    return of(new HttpResponse({ status: 200, body: MOCK_ROLES })).pipe(delay(150));
  }

  // GET /api/users/:id
  const detailMatch = req.url.match(/\/api\/users\/(\d+)$/);
  if (req.method === 'GET' && detailMatch) {
    const id = Number(detailMatch[1]);
    const user = MOCK_USERS.find(u => u.id === id);
    if (user) {
      return of(new HttpResponse({
        status: 200,
        body: {
          ...user,
          phone: '+502 5555-0000',
          last_login: '2026-05-10',
          permissions: ['read', 'write', 'delete'],
        },
      })).pipe(delay(200));
    }
  }

  // Default: pasa la request normal
  return next(req);
};
