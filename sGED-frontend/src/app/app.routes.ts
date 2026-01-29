import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { ChangePasswordComponent } from './features/auth/change-password/change-password.component';
import { LoginComponent } from './features/auth/login/login.component';
import { expedientesRoutes } from './features/expedientes/expedientes.routes';
import { busquedaRoutes } from './features/busqueda/busqueda.routes';
import { adminRoutes } from './features/admin/admin.routes';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'cambiar-password',
    component: ChangePasswordComponent,
    canActivate: [AuthGuard]
  },
  ...busquedaRoutes,
  ...expedientesRoutes,
  {
    path: 'admin',
    children: adminRoutes
  },
  {
    path: '',
    redirectTo: 'expedientes',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'expedientes'
  }
];
