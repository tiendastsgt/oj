// ═══════════════════════════════════════════════════════════════
// user-list-footer.component.ts
// SUBCOMPONENTE PRESENTACIONAL — paginación.
// ═══════════════════════════════════════════════════════════════

import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-user-list-footer',
  templateUrl: './user-list-footer.component.html',
  styleUrl: './user-list-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListFooterComponent {
  page         = input.required<number>();
  totalPages   = input.required<number>();
  totalRecords = input.required<number>();

  pageChange = output<number>();

  // Derivados de los inputs — esto NO es lógica de negocio,
  // es derivación pura de los inputs para evitar cálculos en el HTML.
  canPrev = computed(() => this.page() > 1);
  canNext = computed(() => this.page() < this.totalPages());

  prev(): void {
    if (this.canPrev()) this.pageChange.emit(this.page() - 1);
  }

  next(): void {
    if (this.canNext()) this.pageChange.emit(this.page() + 1);
  }
}
