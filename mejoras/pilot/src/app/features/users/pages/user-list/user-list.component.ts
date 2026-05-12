// ═══════════════════════════════════════════════════════════════
// user-list.component.ts
// ORQUESTADOR. Solo conecta Service + DTO + Vista.
// Cero lógica. Cero HTTP. Cero transformaciones.
// ═══════════════════════════════════════════════════════════════

import { Component, ChangeDetectionStrategy, inject } from '@angular/core';

import { UserListService } from './user-list.service';
import { UserListHeaderComponent } from './components/user-list-header/user-list-header.component';
import { UserListTableComponent } from './components/user-list-table/user-list-table.component';
import { UserListFooterComponent } from './components/user-list-footer/user-list-footer.component';
import { UserDetailModalComponent } from './components/user-detail-modal/user-detail-modal.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    UserListHeaderComponent,
    UserListTableComponent,
    UserListFooterComponent,
    UserDetailModalComponent,
  ],
  providers: [UserListService], // ← Scope local: cada instancia tiene su Service+DTO
})
export class UserListComponent {
  protected svc = inject(UserListService);
  protected dto = this.svc.dto;
}
