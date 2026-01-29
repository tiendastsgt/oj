import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ExpedienteDetailComponent } from './expediente-detail/expediente-detail.component';
import { ExpedienteFormComponent } from './expediente-form/expediente-form.component';
import { ExpedientesListComponent } from './expedientes-list/expedientes-list.component';

@NgModule({
  imports: [RouterModule, ExpedientesListComponent, ExpedienteDetailComponent, ExpedienteFormComponent],
  exports: [ExpedientesListComponent, ExpedienteDetailComponent, ExpedienteFormComponent]
})
export class ExpedientesModule {}
