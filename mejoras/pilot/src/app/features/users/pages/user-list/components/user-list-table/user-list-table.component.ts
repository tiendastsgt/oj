// ═══════════════════════════════════════════════════════════════
// user-list-table.component.ts
// SUBCOMPONENTE PRESENTACIONAL. Renderiza filas, emite eventos.
// ═══════════════════════════════════════════════════════════════

import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { UserRow } from '../../user-list.types';

@Component({
  selector: 'app-user-list-table',
  templateUrl: './user-list-table.component.html',
  styleUrl: './user-list-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListTableComponent {
  users = input.required<UserRow[]>();

  editClick   = output<number>();
  deleteClick = output<number>();
  toggleClick = output<number>();
}
