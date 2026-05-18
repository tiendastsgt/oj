import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpedienteResponse } from '../../../../../core/models/expediente.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-exp-general',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exp-general.component.html',
  styleUrls: ['./exp-general.component.scss']
})
export class ExpGeneralComponent {
  @Input({ required: true }) expediente!: ExpedienteResponse;
  @Input() tipoProcesoName = '';
  @Input() juzgadoName = '';
  @Input() estadoName = '';
  @Input() ancladosCount = 0;
}
