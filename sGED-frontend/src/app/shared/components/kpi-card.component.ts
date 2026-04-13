import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
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
      padding: 1.25rem;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.06);
      backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .kpi-card:hover {
      transform: translateY(-2px);
      border-color: rgba(255, 255, 255, 0.12);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
    }

    .kpi-icon-box {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .kpi-icon-box.blue   { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
    .kpi-icon-box.amber  { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
    .kpi-icon-box.green  { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .kpi-icon-box.violet { background: rgba(139, 92, 246, 0.15); color: #a78bfa; }
    .kpi-icon-box.cyan   { background: rgba(6, 182, 212, 0.15); color: #22d3ee; }
    .kpi-icon-box.rose   { background: rgba(244, 63, 94, 0.15); color: #fb7185; }

    .kpi-value {
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #f1f5f9;
    }

    .kpi-label {
      font-size: 0.75rem;
      color: #94a3b8;
      margin-top: 2px;
    }

    .kpi-trend {
      font-size: 0.7rem;
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 4px;
    }
    .kpi-trend.up { color: #34d399; }
    .kpi-trend.down { color: #fb7185; }
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
