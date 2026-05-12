// ═══════════════════════════════════════════════════════════════
// users.routes.ts
// Rutas del feature Users. Lazy-loaded desde app.routes.
// ═══════════════════════════════════════════════════════════════

import { Routes } from '@angular/router';

export const usersRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/user-list/user-list.component')
        .then(m => m.UserListComponent),
  },
];
