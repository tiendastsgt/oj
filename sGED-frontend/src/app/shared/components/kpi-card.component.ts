import { CommonModule } from '@angular/common';
import { Component, Input , ChangeDetectionStrategy} from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kpi-card">
      <div class="kpi-icon-box" [ngClass]="colorClass">
        <i class="pi" [ngClass]="icon"></i>
      </div>
      <div class="kpi-content">
        <div class="kpi-value">{{ value }}</div>
        <div class="kpi-label">{{ label }}</div>
        <div class="kpi-trend" *ngIf="trend" [class.up]="trend > 0" [class.down]="trend < 0">
          <i class="pi" [ngClass]="trend > 0 ? 'pi-arrow-up' : 'pi-arrow-down'"></i>
          {{ trend }}% desde ayer
        </div>
      </div>
    </div>
  `,
  styles: [`
    .kpi-card {
      padding: var(--space-6);
      border-radius: var(--radius-md);
      background: var(--surface-card);
      border: 1px solid var(--border);
      backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      gap: var(--space-4);
      transition: all var(--duration-normal) var(--ease-out);
      &:hover { transform: translateY(-2px); border-color: var(--border-hover); box-shadow: var(--shadow-lg); }
    }

    .kpi-icon-box {
      width: 48px; height: 48px;
      border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;
      &.blue   { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
      &.amber  { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
      &.green  { background: rgba(16, 185, 129, 0.15); color: #34d399; }
      &.violet { background: rgba(139, 92, 246, 0.15); color: #a78bfa; }
    }

    .kpi-value {
      font-size: var(--font-2xl);
      font-weight: 800;
      letter-spacing: -0.02em;
      color: white;
    }

    .kpi-label {
      font-size: var(--font-xs);
      color: var(--text-secondary);
      margin-top: 2px;
    }

    .kpi-trend {
      font-size: 0.7rem;
      display: flex; align-items: center; gap: 4px; margin-top: 4px;
      &.up { color: var(--accent-emerald); }
      &.down { color: var(--accent-rose); }
    }
  `]
})
export class KpiCardComponent {
  @Input() label: string = '';
  @Input() value: string | number = 0;
  @Input() icon: string = 'pi-chart-bar';
  @Input() color: string = 'blue';
  @Input() trend?: number;

  get colorClass(): string {
    return this.color;
  }
}
