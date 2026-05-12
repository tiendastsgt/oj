import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';
import { DocumentosListComponent } from '../documentos-list/documentos-list.component';
import { DocumentoViewerComponent } from '../documento-viewer/documento-viewer.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';
import { ExpedienteDetailService } from './expediente-detail.service';

@Component({
  selector: 'app-expediente-detail',
  templateUrl: './expediente-detail.component.html',
  styleUrl: './expediente-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    DatePipe,
    RouterModule,
    ButtonModule,
    CardModule,
    MessageModule,
    TabsModule,
    TooltipModule,
    DocumentosListComponent,
    DocumentoViewerComponent,
    StatusBadgeComponent,
  ],
  providers: [ExpedienteDetailService],
})
export class ExpedienteDetailComponent {
  protected svc = inject(ExpedienteDetailService);
  protected dto = this.svc.dto;
}
