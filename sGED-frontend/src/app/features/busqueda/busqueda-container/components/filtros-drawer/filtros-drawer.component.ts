import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FiltrosDrawerState } from '../../busqueda-container.types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-filtros-drawer',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './filtros-drawer.component.html',
  styleUrls: ['./filtros-drawer.component.scss'],
})
export class FiltrosDrawerComponent {
  open = input.required<boolean>();
  close = output<void>();
  apply = output<FiltrosDrawerState>();
  clear = output<void>();

  protected local: FiltrosDrawerState = {
    fechaDesde: '', fechaHasta: '',
    soloAnclados: false, soloAsignados: false, soloAudienciaProxima: false,
  };

  constructor() {
    // Reset local state when drawer reopens
    effect(() => {
      if (this.open()) {
        this.local = { ...this.local };
      }
    });
  }

  protected applyFilters(): void {
    this.apply.emit({ ...this.local });
  }

  protected clearFilters(): void {
    this.local = {
      fechaDesde: '', fechaHasta: '',
      soloAnclados: false, soloAsignados: false, soloAudienciaProxima: false,
    };
    this.clear.emit();
  }
}
