import { signal } from '@angular/core';
import { ActiveTab } from './busqueda-container.types';

export class BusquedaContainerDto {
  activeTab = signal<ActiveTab>('avanzada');
}
