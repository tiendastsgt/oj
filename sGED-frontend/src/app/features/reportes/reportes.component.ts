import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { OjShellComponent } from '../../shared/components/oj-shell/oj-shell.component';
import { ReportesService } from './reportes.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, OjShellComponent],
  providers: [ReportesService],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent {
  protected svc = inject(ReportesService);
  protected dto = this.svc.dto;
}
