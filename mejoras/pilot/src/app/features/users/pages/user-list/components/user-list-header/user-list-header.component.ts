// ═══════════════════════════════════════════════════════════════
// user-list-header.component.ts
// SUBCOMPONENTE PRESENTACIONAL ("tonto").
// Solo recibe inputs y emite outputs. No conoce al Service.
// ═══════════════════════════════════════════════════════════════

import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { DropdownOption } from '../../user-list.types';

@Component({
  selector: 'app-user-list-header',
  templateUrl: './user-list-header.component.html',
  styleUrl: './user-list-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListHeaderComponent {
  // Inputs como signals
  searchTerm   = input.required<string>();
  roleOptions  = input.required<DropdownOption[]>();
  selectedRole = input<number | null>(null);
  resultCount  = input<number>(0);

  // Outputs
  searchChange = output<string>();
  roleChange   = output<number | null>();
  reloadClick  = output<void>();

  // Helpers de template (no son lógica de negocio, solo eventos del DOM)
  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchChange.emit(value);
  }

  onRoleSelect(event: Event): void {
    const raw = (event.target as HTMLSelectElement).value;
    this.roleChange.emit(raw === '' ? null : Number(raw));
  }
}
