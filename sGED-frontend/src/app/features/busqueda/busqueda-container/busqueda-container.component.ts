import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { BusquedaAvanzadaComponent } from '../busqueda-avanzada/busqueda-avanzada.component';
import { BusquedaRapidaComponent } from '../busqueda-rapida/busqueda-rapida.component';
import { BusquedaContainerService } from './busqueda-container.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-busqueda-container',
  standalone: true,
  imports: [CommonModule, TabsModule, BusquedaRapidaComponent, BusquedaAvanzadaComponent],
  providers: [BusquedaContainerService],
  templateUrl: './busqueda-container.component.html',
  styleUrls: ['./busqueda-container.component.scss']
})
export class BusquedaContainerComponent {
  protected svc = inject(BusquedaContainerService);
  protected dto = this.svc.dto;
}
