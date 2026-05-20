import { Component, ChangeDetectionStrategy, input } from '@angular/core';
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
  templateUrl: './criterios-generales.component.html',
  styleUrls: ['./criterios-generales.component.scss'],
})
export class CriteriosGeneralesComponent {
  formGroup = input.required<FormGroup>();
  tiposProceso = input<TipoProceso[]>([]);
  estados = input<EstadoExpediente[]>([]);
  juzgados = input<Juzgado[]>([]);
}
