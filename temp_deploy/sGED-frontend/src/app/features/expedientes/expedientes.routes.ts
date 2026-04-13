import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { DocumentosPageComponent } from '../documentos/documentos-page.component';
import { ExpedienteDetailComponent } from './expediente-detail/expediente-detail.component';
import { ExpedienteFormComponent } from './expediente-form/expediente-form.component';
import { ExpedientesListComponent } from './expedientes-list/expedientes-list.component';

export const expedientesRoutes: Routes = [
  {
    path: 'expedientes',
    component: ExpedientesListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'expedientes/nuevo',
    component: ExpedienteFormComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'expedientes/:id/documentos',
    component: DocumentosPageComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'expedientes/:id/editar',
    component: ExpedienteFormComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'expedientes/:id',
    component: ExpedienteDetailComponent,
    canActivate: [AuthGuard]
  }
];
