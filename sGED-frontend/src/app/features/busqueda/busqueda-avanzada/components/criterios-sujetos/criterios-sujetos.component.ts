import { Component, Input , ChangeDetectionStrategy} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-criterios-sujetos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, FloatLabelModule],
  template: `
    <div [formGroup]="formGroup" class="criterios-grid">
      <!-- Actor -->
      <div class="field-container">
        <p-floatlabel>
          <input pInputText id="actorPrincipal" formControlName="actorPrincipal" class="w-full premium-input" />
          <label for="actorPrincipal">Actor / Demandante / Ministerio Público</label>
        </p-floatlabel>
      </div>

      <!-- Demandado -->
      <div class="field-container">
        <p-floatlabel>
          <input pInputText id="demandadoPrincipal" formControlName="demandadoPrincipal" class="w-full premium-input" />
          <label for="demandadoPrincipal">Demandado / Sindicado</label>
        </p-floatlabel>
      </div>
    </div>
  `,
  styleUrls: ['./criterios-sujetos.component.scss']
})
export class CriteriosSujetosComponent {
  @Input({ required: true }) formGroup!: FormGroup;
}
