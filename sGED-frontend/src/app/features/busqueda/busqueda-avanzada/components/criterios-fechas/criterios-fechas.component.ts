import { Component, Input , ChangeDetectionStrategy} from '@angular/core';
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
  template: `
    <div [formGroup]="formGroup" class="criterios-grid">
      <!-- Fecha Desde -->
      <div class="field-container">
        <p-floatlabel>
          <p-datepicker 
            id="fechaDesde" 
            formControlName="fechaDesde" 
            dateFormat="yy-mm-dd" 
            [showIcon]="true" 
            styleClass="w-full premium-input">
          </p-datepicker>
          <label for="fechaDesde">Fecha Desde</label>
        </p-floatlabel>
      </div>

      <!-- Fecha Hasta -->
      <div class="field-container">
        <p-floatlabel>
          <p-datepicker 
            id="fechaHasta" 
            formControlName="fechaHasta" 
            dateFormat="yy-mm-dd" 
            [showIcon]="true" 
            styleClass="w-full premium-input">
          </p-datepicker>
          <label for="fechaHasta">Fecha Hasta</label>
        </p-floatlabel>
        @if (formGroup.hasError('dateRange')) {
        <small class="error-text">
          La fecha desde debe ser menor o igual a la fecha hasta
        </small>
        }
      </div>
    </div>
  `,
  styleUrls: ['./criterios-fechas.component.scss']
})
export class CriteriosFechasComponent {
  @Input({ required: true }) formGroup!: FormGroup;
}
