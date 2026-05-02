import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule],
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss']
})
export class EmptyStateComponent {
  @Input() icon = 'pi pi-inbox';
  @Input() titulo = 'Sin datos';
  @Input() mensaje = '';
  @Input() ctaLabel = '';
  @Output() ctaClick = new EventEmitter<void>();
}
