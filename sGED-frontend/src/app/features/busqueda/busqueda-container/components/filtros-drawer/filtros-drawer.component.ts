import {
  ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FiltrosDrawerState } from '../../busqueda-container.types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-filtros-drawer',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './filtros-drawer.component.html',
  styleUrls: ['./filtros-drawer.component.scss']
})
export class FiltrosDrawerComponent implements OnChanges {
  @Input({ required: true }) open = false;
  @Output() close = new EventEmitter<void>();
  @Output() apply = new EventEmitter<FiltrosDrawerState>();
  @Output() clear = new EventEmitter<void>();

  protected local: FiltrosDrawerState = {
    fechaDesde: '', fechaHasta: '',
    soloAnclados: false, soloAsignados: false, soloAudienciaProxima: false
  };

  ngOnChanges(changes: SimpleChanges): void {
    // Reset local state when drawer reopens
    if (changes['open']?.currentValue === true) {
      this.local = { ...this.local };
    }
  }

  protected applyFilters(): void {
    this.apply.emit({ ...this.local });
  }

  protected clearFilters(): void {
    this.local = {
      fechaDesde: '', fechaHasta: '',
      soloAnclados: false, soloAsignados: false, soloAudienciaProxima: false
    };
    this.clear.emit();
  }
}
