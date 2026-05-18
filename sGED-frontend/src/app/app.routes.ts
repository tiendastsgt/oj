import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    redirectTo: 'busqueda',
    pathMatch: 'full'
  },
  {
    path: 'cambiar-password',
    loadComponent: () =>
      import('./features/auth/change-password/change-password.component').then(m => m.ChangePasswordComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'busqueda',
    loadComponent: () =>
      import('./features/busqueda/busqueda-container/busqueda-container.component').then(m => m.BusquedaContainerComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'expedientes',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/expedientes/expedientes-list/expedientes-list.component').then(m => m.ExpedientesListComponent)
      },
      {
        path: 'nuevo',
        loadComponent: () =>
          import('./features/expedientes/expediente-form/expediente-form.component').then(m => m.ExpedienteFormComponent)
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/expedientes/expediente-detail/expediente-detail.component').then(m => m.ExpedienteDetailComponent)
      },
      {
        path: ':id/documentos',
        loadComponent: () =>
          import('./features/documentos/documentos-page.component').then(m => m.DocumentosPageComponent)
      },
      {
        path: ':id/editar',
        loadComponent: () =>
          import('./features/expedientes/expediente-form/expediente-form.component').then(m => m.ExpedienteFormComponent)
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { requiredRole: 'ADMINISTRADOR' },
    children: [
      {
        path: 'usuarios',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/admin/usuarios/usuarios-list/usuarios-list.component').then(m => m.UsuariosListComponent)
          },
          {
            path: 'nuevo',
            loadComponent: () =>
              import('./features/admin/usuarios/usuario-form/usuario-form.component').then(m => m.UsuarioFormComponent)
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/admin/usuarios/usuario-detail/usuario-detail.component').then(m => m.UsuarioDetailComponent)
          },
          {
            path: ':id/editar',
            loadComponent: () =>
              import('./features/admin/usuarios/usuario-form/usuario-form.component').then(m => m.UsuarioFormComponent)
          }
        ]
      },
      {
        path: 'auditoria',
        loadComponent: () =>
          import('./features/admin/auditoria/auditoria-list/auditoria-list.component').then(m => m.AuditoriaListComponent)
      }
    ]
  },
  {
    path: 'presentacion/:expedienteNum',
    loadComponent: () =>
      import('./features/presentacion/presentacion.component').then(m => m.PresentacionComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'reportes',
    loadComponent: () =>
      import('./features/reportes/reportes.component').then(m => m.ReportesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: 'busqueda',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'busqueda'
  }
];
