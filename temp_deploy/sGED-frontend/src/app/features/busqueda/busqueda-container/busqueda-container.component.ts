import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { BusquedaRapidaComponent } from '../busqueda-rapida/busqueda-rapida.component';
import { BusquedaAvanzadaComponent } from '../busqueda-avanzada/busqueda-avanzada.component';

@Component({
  selector: 'app-busqueda-container',
  standalone: true,
  imports: [CommonModule, TabsModule, BusquedaRapidaComponent, BusquedaAvanzadaComponent],
  templateUrl: './busqueda-container.component.html',
  styleUrls: ['./busqueda-container.component.scss']
})
export class BusquedaContainerComponent {}
