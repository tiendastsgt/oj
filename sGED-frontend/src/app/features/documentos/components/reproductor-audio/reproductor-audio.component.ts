import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-reproductor-audio',
  standalone: true,
  imports: [],
  templateUrl: './reproductor-audio.component.html',
  styleUrls: ['./reproductor-audio.component.scss']
})
export class ReproductorAudioComponent {
  readonly url = input<string>('');
}
