import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { OjShellComponent } from '../../../../shared/components/oj-shell/oj-shell.component';
import { AuditoriaListService } from './auditoria-list.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-auditoria-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastModule, OjShellComponent],
  providers: [AuditoriaListService, MessageService],
  templateUrl: './auditoria-list.component.html',
  styleUrls: ['./auditoria-list.component.scss']
})
export class AuditoriaListComponent {
  protected svc = inject(AuditoriaListService);
  protected dto = this.svc.dto;
}
