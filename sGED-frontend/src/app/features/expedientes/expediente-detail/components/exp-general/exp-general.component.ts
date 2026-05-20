import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpedienteResponse } from '../../../../../core/models/expediente.model';
import { DocumentCountByTipo } from '../../expediente-detail.types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-exp-general',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exp-general.component.html',
  styleUrls: ['./exp-general.component.scss'],
})
export class ExpGeneralComponent {
  expediente = input.required<ExpedienteResponse>();
  tipoProcesoName = input<string>('');
  juzgadoName = input<string>('');
  estadoName = input<string>('');
  ancladosCount = input<number>(0);
  countByTipo = input<DocumentCountByTipo>({ doc: 0, video: 0, audio: 0, img: 0 });
}
