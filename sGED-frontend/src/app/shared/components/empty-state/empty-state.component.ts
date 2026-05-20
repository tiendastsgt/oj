import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule],
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss'],
})
export class EmptyStateComponent {
  icon = input<string>('pi pi-inbox');
  titulo = input<string>('Sin datos');
  mensaje = input<string>('');
  ctaLabel = input<string>('');
  ctaClick = output<void>();
}
