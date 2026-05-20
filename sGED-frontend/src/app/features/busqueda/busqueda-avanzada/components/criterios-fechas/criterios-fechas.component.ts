import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DatePickerModule } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageModule } from 'primeng/message';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-criterios-fechas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePickerModule, FloatLabelModule, MessageModule],
  templateUrl: './criterios-fechas.component.html',
  styleUrls: ['./criterios-fechas.component.scss'],
})
export class CriteriosFechasComponent {
  formGroup = input.required<FormGroup>();
}
