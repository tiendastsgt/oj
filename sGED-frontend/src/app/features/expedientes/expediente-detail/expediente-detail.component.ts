import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { OjShellComponent } from '../../../shared/components/oj-shell/oj-shell.component';
import { ExpGeneralComponent } from './components/exp-general/exp-general.component';
import { ExpArchivosComponent } from './components/exp-archivos/exp-archivos.component';
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
    ExpGeneralComponent,
    ExpArchivosComponent,
  ],
  providers: [ExpedienteDetailService],
})
export class ExpedienteDetailComponent {
  protected svc = inject(ExpedienteDetailService);
  protected dto = this.svc.dto;
}
