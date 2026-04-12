import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="statusClass">
      <i class="pi" [ngClass]="statusIcon"></i>
      {{ status }}
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 0.3px;
      text-transform: uppercase;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      transition: all 0.2s ease;
      cursor: default;
    }

    .badge-activo {
      background-color: rgba(34, 197, 94, 0.15);
      color: #15803d;
      border: 1px solid rgba(34, 197, 94, 0.2);
    }

    .badge-cerrado {
      background-color: rgba(239, 68, 68, 0.15);
      color: #b91c1c;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .badge-pendiente {
      background-color: rgba(234, 179, 8, 0.15);
      color: #a16207;
      border: 1px solid rgba(234, 179, 8, 0.2);
    }

    .badge-proceso {
      background-color: rgba(59, 130, 246, 0.15);
      color: #1d4ed8;
      border: 1px solid rgba(59, 130, 246, 0.2);
    }

    .badge i {
      font-size: 0.75rem;
    }

    .badge:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.08);
    }
  `]
})
export class StatusBadgeComponent {
  @Input() status: string = '';

  get statusClass(): string {
    const s = this.status?.toLowerCase() || '';
    if (s.includes('activo')) return 'badge-activo';
    if (s.includes('cerrado')) return 'badge-cerrado';
    if (s.includes('pendiente')) return 'badge-pendiente';
    if (s.includes('proceso')) return 'badge-proceso';
    return '';
  }

  get statusIcon(): string {
    const s = this.status?.toLowerCase() || '';
    if (s.includes('activo')) return 'pi-check-circle';
    if (s.includes('cerrado')) return 'pi-times-circle';
    if (s.includes('pendiente')) return 'pi-clock';
    if (s.includes('proceso')) return 'pi-spinner';
    return 'pi-info-circle';
  }
}
