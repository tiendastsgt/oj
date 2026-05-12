import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-visor-imagen',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './visor-imagen.component.html',
  styleUrls: ['./visor-imagen.component.scss']
})
export class VisorImagenComponent {
  readonly url  = input<string>('');
  readonly zoom = signal(1);

  zoomIn(): void  { this.zoom.update(z => Math.min(z + 0.2, 3)); }
  zoomOut(): void { this.zoom.update(z => Math.max(z - 0.2, 0.5)); }
}
