import { Injectable } from '@angular/core';
import { BusquedaContainerDto } from './busqueda-container.dto';
import { ActiveTab } from './busqueda-container.types';

@Injectable()
export class BusquedaContainerService {
  readonly dto = new BusquedaContainerDto();

  setActiveTab(tab: ActiveTab): void {
    this.dto.activeTab.set(tab);
  }
}
