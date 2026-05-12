import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ExpedienteFormService } from './expediente-form.service';

@Component({
  selector: 'app-expediente-form',
  templateUrl: './expediente-form.component.html',
  styleUrl: './expediente-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    CardModule,
    DatePickerModule,
    InputTextModule,
    MessageModule,
    SelectModule,
    TextareaModule,
  ],
  providers: [ExpedienteFormService],
})
export class ExpedienteFormComponent {
  protected svc = inject(ExpedienteFormService);
  protected dto = this.svc.dto;
}
