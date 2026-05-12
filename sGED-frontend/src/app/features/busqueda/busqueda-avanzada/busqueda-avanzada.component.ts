import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { ResultadosBusquedaComponent } from '../resultados-busqueda/resultados-busqueda.component';
import { BusquedaAvanzadaService } from './busqueda-avanzada.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-busqueda-avanzada',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    CardModule, InputTextModule, DatePickerModule, SelectModule,
    ButtonModule, MessageModule,
    ResultadosBusquedaComponent
  ],
  providers: [BusquedaAvanzadaService],
  templateUrl: './busqueda-avanzada.component.html',
  styleUrls: ['./busqueda-avanzada.component.scss']
})
export class BusquedaAvanzadaComponent {
  protected svc = inject(BusquedaAvanzadaService);
  protected dto = this.svc.dto;
}
