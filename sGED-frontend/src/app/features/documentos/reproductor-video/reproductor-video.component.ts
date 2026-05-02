import { CommonModule } from '@angular/common';
import { Component, Input , ChangeDetectionStrategy} from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-reproductor-video',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reproductor-video.component.html',
  styleUrls: ['./reproductor-video.component.scss']
})
export class ReproductorVideoComponent {
  @Input() url = '';
}
