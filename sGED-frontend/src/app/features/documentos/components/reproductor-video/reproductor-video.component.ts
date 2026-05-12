import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-reproductor-video',
  standalone: true,
  imports: [],
  templateUrl: './reproductor-video.component.html',
  styleUrls: ['./reproductor-video.component.scss']
})
export class ReproductorVideoComponent {
  readonly url = input<string>('');
}
