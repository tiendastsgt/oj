import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { BusquedaContainerComponent } from './busqueda-container/busqueda-container.component';

export const busquedaRoutes: Routes = [
  {
    path: 'busqueda',
    component: BusquedaContainerComponent,
    canActivate: [AuthGuard]
  }
];
