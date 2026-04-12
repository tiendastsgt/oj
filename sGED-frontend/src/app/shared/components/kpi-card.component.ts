import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kpi-card" [ngStyle]="{'border-left-color': color}">
      <div class="kpi-content">
        <span class="kpi-label">{{ label }}</span>
        <h3 class="kpi-value">{{ value }}</h3>
        <span class="kpi-trend" *ngIf="trend">
          <i class="pi" [ngClass]="trend > 0 ? 'pi-arrow-up' : 'pi-arrow-down'"></i>
          {{ trend }}% desde ayer
        </span>
      </div>
      <div class="kpi-icon-container" [style.background-color]="color + '1A'">
        <i class="pi kpi-icon" [ngClass]="icon" [style.color]="color"></i>
      </div>
    </div>
  `,
  styles: [`
    .kpi-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px solid #f1f5f9;
      border-left: 4px solid;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      height: 100%;
    }

    .kpi-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
    }

    .kpi-label {
      font-size: 0.825rem;
      color: #64748b;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: block;
      margin-bottom: 4px;
    }

    .kpi-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .kpi-trend {
      font-size: 0.75rem;
      color: #94a3b8;
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 8px;
    }

    .kpi-icon-container {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .kpi-icon {
      font-size: 1.25rem;
    }
  `]
})
export class KpiCardComponent {
  @Input() label: string = '';
  @Input() value: string | number = 0;
  @Input() icon: string = 'pi-chart-bar';
  @Input() color: string = '#3b82f6';
  @Input() trend?: number;
}
