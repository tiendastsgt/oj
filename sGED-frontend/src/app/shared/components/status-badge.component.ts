import { CommonModule } from '@angular/common';
import { Component, Input , ChangeDetectionStrategy} from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="statusClass">
      <i class="pi" [ngClass]="statusIcon"></i>
      {{ displayStatus }}
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    .badge-activo {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.2);
    }

    .badge-cerrado {
      background: rgba(148, 163, 184, 0.1);
      color: #94a3b8;
      border: 1px solid rgba(148, 163, 184, 0.15);
    }

    .badge-pendiente {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.2);
    }

    .badge-proceso {
      background: rgba(59, 130, 246, 0.15);
      color: #60a5fa;
      border: 1px solid rgba(59, 130, 246, 0.2);
    }

    .badge i {
      font-size: 0.7rem;
    }
  `]
})
export class StatusBadgeComponent {
  @Input() status: any = '';

  get displayStatus(): string {
    if (this.status === 1 || this.status === 'ACTIVO') return 'Activo';
    if (this.status === 2 || this.status === 'CERRADO') return 'Cerrado';
    if (this.status === 3 || this.status === 'PENDIENTE') return 'Pendiente';
    if (this.status === 4 || this.status === 'EN PROCESO') return 'En Proceso';
    return String(this.status || '');
  }

  get statusClass(): string {
    const s = this.displayStatus.toLowerCase();
    if (s.includes('activo')) return 'badge-activo';
    if (s.includes('cerrado')) return 'badge-cerrado';
    if (s.includes('pendiente')) return 'badge-pendiente';
    if (s.includes('proceso')) return 'badge-proceso';
    return '';
  }

  get statusIcon(): string {
    const s = this.displayStatus.toLowerCase();
    if (s.includes('activo')) return 'pi-check-circle';
    if (s.includes('cerrado')) return 'pi-times-circle';
    if (s.includes('pendiente')) return 'pi-clock';
    if (s.includes('proceso')) return 'pi-spinner';
    return 'pi-info-circle';
  }
}
