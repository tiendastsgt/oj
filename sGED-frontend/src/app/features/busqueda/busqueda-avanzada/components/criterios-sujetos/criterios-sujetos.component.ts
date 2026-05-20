import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-criterios-sujetos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, FloatLabelModule],
  templateUrl: './criterios-sujetos.component.html',
  styleUrls: ['./criterios-sujetos.component.scss'],
})
export class CriteriosSujetosComponent {
  formGroup = input.required<FormGroup>();
}
