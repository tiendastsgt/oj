import { CommonModule } from '@angular/common';
import { Component , ChangeDetectionStrategy} from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { BusquedaRapidaComponent } from '../busqueda-rapida/busqueda-rapida.component';
import { BusquedaAvanzadaComponent } from '../busqueda-avanzada/busqueda-avanzada.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-busqueda-container',
  standalone: true,
  imports: [CommonModule, TabsModule, BusquedaRapidaComponent, BusquedaAvanzadaComponent],
  templateUrl: './busqueda-container.component.html',
  styleUrls: ['./busqueda-container.component.scss']
})
export class BusquedaContainerComponent {
  activeTab: 'rapida' | 'avanzada' = 'avanzada';

  setActiveTab(tab: 'rapida' | 'avanzada') {
    this.activeTab = tab;
  }
}
