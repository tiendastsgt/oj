import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageService } from 'primeng/api';
import { AuditoriaListService } from './auditoria-list.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-auditoria-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    ButtonModule, TableModule, InputTextModule,
    InputNumberModule, PaginatorModule, ToastModule, ToolbarModule
  ],
  providers: [AuditoriaListService, MessageService],
  templateUrl: './auditoria-list.component.html',
  styleUrls: ['./auditoria-list.component.scss']
})
export class AuditoriaListComponent {
  protected svc = inject(AuditoriaListService);
  protected dto = this.svc.dto;
}
