import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { OjShellComponent } from '../../../../shared/components/oj-shell/oj-shell.component';
import { UsuariosListService } from './usuarios-list.service';

function initials(name: string): string {
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

const ROL_BADGE: Record<string, string> = {
  ADMINISTRADOR: 'rojo', JUEZ: 'azul', SECRETARIO: 'verde', ASESOR: 'dorado'
};

const ROL_AVATAR: Record<string, string> = {
  ADMINISTRADOR: 'admin', JUEZ: 'juez', SECRETARIO: 'secretario', ASESOR: 'asesor'
};

@Component({
  selector: 'app-usuarios-list',
  templateUrl: './usuarios-list.component.html',
  styleUrls: ['./usuarios-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TableModule, ConfirmDialogModule, ToastModule, OjShellComponent],
  providers: [UsuariosListService, ConfirmationService, MessageService],
})
export class UsuariosListComponent {
  protected svc = inject(UsuariosListService);
  protected dto = this.svc.dto;

  protected readonly initials = initials;
  protected rolBadge(rol: string): string  { return ROL_BADGE[rol]  ?? 'default'; }
  protected rolAvatar(rol: string): string { return ROL_AVATAR[rol] ?? 'default'; }
}
