import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-card.component.html',
  styleUrl: './kpi-card.component.scss',
})
export class KpiCardComponent {
  label = input<string>('');
  value = input<string | number>(0);
  icon = input<string>('pi-chart-bar');
  color = input<string>('blue');
  trend = input<number | undefined>(undefined);
}
