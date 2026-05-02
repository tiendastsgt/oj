import { CommonModule } from '@angular/common';
import { Component, Input , ChangeDetectionStrategy} from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-visor-imagen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visor-imagen.component.html',
  styleUrls: ['./visor-imagen.component.scss']
})
export class VisorImagenComponent {
  @Input() url = '';
  zoom = 1;

  zoomIn(): void {
    this.zoom = Math.min(this.zoom + 0.2, 3);
  }

  zoomOut(): void {
    this.zoom = Math.max(this.zoom - 0.2, 0.5);
  }
}
