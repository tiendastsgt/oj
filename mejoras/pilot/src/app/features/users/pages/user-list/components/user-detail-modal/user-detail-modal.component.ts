// ═══════════════════════════════════════════════════════════════
// user-detail-modal.component.ts
// SUBCOMPONENTE PRESENTACIONAL — modal de detalle de usuario.
// Recibe el estado (loading/error/data) ya resuelto.
// ═══════════════════════════════════════════════════════════════

import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { UserDetail } from '../../user-list.types';

@Component({
  selector: 'app-user-detail-modal',
  templateUrl: './user-detail-modal.component.html',
  styleUrl: './user-detail-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailModalComponent {
  user      = input<UserDetail | null>(null);
  isLoading = input<boolean>(false);
  error     = input<string | null>(null);

  close = output<void>();

  onBackdropClick(event: MouseEvent): void {
    // Cerrar solo si el click fue en el backdrop, no en el contenido
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
