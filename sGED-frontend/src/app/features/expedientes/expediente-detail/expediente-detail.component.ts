import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { OjShellComponent } from '../../../shared/components/oj-shell/oj-shell.component';
import { DocumentosListComponent } from '../documentos-list/documentos-list.component';
import { DocumentoViewerComponent } from '../documento-viewer/documento-viewer.component';
import { ExpGeneralComponent } from './components/exp-general/exp-general.component';
import { ExpedienteDetailService } from './expediente-detail.service';

@Component({
  selector: 'app-expediente-detail',
  templateUrl: './expediente-detail.component.html',
  styleUrl: './expediente-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MessageModule,
    OjShellComponent,
    DocumentosListComponent,
    DocumentoViewerComponent,
    ExpGeneralComponent,
  ],
  providers: [ExpedienteDetailService],
})
export class ExpedienteDetailComponent {
  protected svc = inject(ExpedienteDetailService);
  protected dto = this.svc.dto;
}
