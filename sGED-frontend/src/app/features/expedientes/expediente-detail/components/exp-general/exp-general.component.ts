import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpedienteResponse } from '../../../../../core/models/expediente.model';
import { DocumentCountByTipo } from '../../expediente-detail.types';

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
  @Input() countByTipo: DocumentCountByTipo = { doc: 0, video: 0, audio: 0, img: 0 };
}
