import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';
import { ExpedientesListService } from './expedientes-list.service';

@Component({
  selector: 'app-expedientes-list',
  templateUrl: './expedientes-list.component.html',
  styleUrl: './expedientes-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    RouterModule,
    DatePipe,
    TableModule,
    ButtonModule,
    StatusBadgeComponent,
  ],
  providers: [ExpedientesListService],
})
export class ExpedientesListComponent {
  protected svc = inject(ExpedientesListService);
  protected dto = this.svc.dto;
}
