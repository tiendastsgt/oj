import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { UsuariosListComponent } from './usuarios/usuarios-list/usuarios-list.component';
import { UsuarioFormComponent } from './usuarios/usuario-form/usuario-form.component';
import { UsuarioDetailComponent } from './usuarios/usuario-detail/usuario-detail.component';
import { AuditoriaListComponent } from './auditoria/auditoria-list/auditoria-list.component';

export const adminRoutes: Routes = [
  {
    path: 'usuarios',
    component: UsuariosListComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { requiredRole: 'ADMINISTRADOR' }
  },
  {
    path: 'usuarios/nuevo',
    component: UsuarioFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { requiredRole: 'ADMINISTRADOR' }
  },
  {
    path: 'usuarios/:id',
    component: UsuarioDetailComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { requiredRole: 'ADMINISTRADOR' }
  },
  {
    path: 'usuarios/:id/editar',
    component: UsuarioFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { requiredRole: 'ADMINISTRADOR' }
  },
  {
    path: 'auditoria',
    component: AuditoriaListComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { requiredRole: 'ADMINISTRADOR' }
  }
];
