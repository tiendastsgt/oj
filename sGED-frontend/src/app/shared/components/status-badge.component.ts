import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
})
export class StatusBadgeComponent {
  status = input<string | number>('');

  get displayStatus(): string {
    const s = this.status();
    if (s === 1 || s === 'ACTIVO') return 'Activo';
    if (s === 2 || s === 'CERRADO') return 'Cerrado';
    if (s === 3 || s === 'PENDIENTE') return 'Pendiente';
    if (s === 4 || s === 'EN PROCESO') return 'En Proceso';
    return String(s || '');
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
