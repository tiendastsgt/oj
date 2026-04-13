import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
  selector: 'app-criterios-referencia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, FloatLabelModule],
  template: `
    <div [formGroup]="formGroup" class="criterios-grid">
      <!-- Referencia SGT -->
      <div class="field-container">
        <p-floatlabel>
          <input pInputText id="referenciaSgt" formControlName="referenciaSgt" class="w-full premium-input" />
          <label for="referenciaSgt">ID en Sistema de Gestión de Tribunales (SGT)</label>
        </p-floatlabel>
      </div>
    </div>
  `,
  styleUrls: ['./criterios-referencia.component.scss']
})
export class CriteriosReferenciaComponent {
  @Input({ required: true }) formGroup!: FormGroup;
}
