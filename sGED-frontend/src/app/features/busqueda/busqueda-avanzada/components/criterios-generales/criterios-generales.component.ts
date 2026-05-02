import { Component, Input , ChangeDetectionStrategy} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { EstadoExpediente, Juzgado, TipoProceso } from '../../../../../core/models/catalogos.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-criterios-generales',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, SelectModule, FloatLabelModule],
  template: `
    <div [formGroup]="formGroup" class="criterios-grid">
      <!-- Número -->
      <div class="field-container">
        <p-floatlabel>
          <input pInputText id="numero" formControlName="numero" class="w-full premium-input" />
          <label for="numero">Número de Expediente</label>
        </p-floatlabel>
      </div>

      <!-- Tipo de Proceso -->
      <div class="field-container">
        <p-floatlabel>
          <p-select 
            id="tipoProcesoId" 
            formControlName="tipoProcesoId" 
            [options]="tiposProceso" 
            optionLabel="nombre" 
            optionValue="id" 
            [showClear]="true" 
            styleClass="w-full premium-input">
          </p-select>
          <label for="tipoProcesoId">Tipo de Proceso</label>
        </p-floatlabel>
      </div>

      <!-- Estado -->
      <div class="field-container">
        <p-floatlabel>
          <p-select 
            id="estadoId" 
            formControlName="estadoId" 
            [options]="estados" 
            optionLabel="nombre" 
            optionValue="id" 
            [showClear]="true" 
            styleClass="w-full premium-input">
          </p-select>
          <label for="estadoId">Estado</label>
        </p-floatlabel>
      </div>

      <!-- Juzgado -->
      <div class="field-container">
        <p-floatlabel>
          <p-select 
            id="juzgadoId" 
            formControlName="juzgadoId" 
            [options]="juzgados" 
            optionLabel="nombre" 
            optionValue="id" 
            [showClear]="true" 
            styleClass="w-full premium-input">
          </p-select>
          <label for="juzgadoId">Juzgado Asignado</label>
        </p-floatlabel>
      </div>
    </div>
  `,
  styleUrls: ['./criterios-generales.component.scss']
})
export class CriteriosGeneralesComponent {
  @Input({ required: true }) formGroup!: FormGroup;
  @Input() tiposProceso: TipoProceso[] = [];
  @Input() estados: EstadoExpediente[] = [];
  @Input() juzgados: Juzgado[] = [];
}
