import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { OjShellComponent } from '../../../../shared/components/oj-shell/oj-shell.component';
import { UsuarioFormService } from './usuario-form.service';

@Component({
  selector: 'app-usuario-form',
  templateUrl: './usuario-form.component.html',
  styleUrls: ['./usuario-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastModule, OjShellComponent],
  providers: [UsuarioFormService, MessageService],
})
export class UsuarioFormComponent {
  protected svc = inject(UsuarioFormService);
  protected dto = this.svc.dto;
}
