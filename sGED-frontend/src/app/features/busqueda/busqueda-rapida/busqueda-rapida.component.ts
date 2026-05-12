import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ResultadosBusquedaComponent } from '../resultados-busqueda/resultados-busqueda.component';
import { BusquedaRapidaService } from './busqueda-rapida.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-busqueda-rapida',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule, CardModule, InputTextModule, ButtonModule, MessageModule, ResultadosBusquedaComponent],
  providers: [BusquedaRapidaService],
  templateUrl: './busqueda-rapida.component.html',
  styleUrls: ['./busqueda-rapida.component.scss']
})
export class BusquedaRapidaComponent {
  protected svc = inject(BusquedaRapidaService);
  protected dto = this.svc.dto;
}
