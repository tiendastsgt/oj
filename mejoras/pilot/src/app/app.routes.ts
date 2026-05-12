// ═══════════════════════════════════════════════════════════════
// app.routes.ts
// Rutas top-level. El feature `users` se carga lazy.
// ═══════════════════════════════════════════════════════════════

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full',
  },
  {
    path: 'users',
    loadChildren: () =>
      import('./features/users/users.routes').then(m => m.usersRoutes),
  },
];
