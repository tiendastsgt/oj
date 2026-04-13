import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-reproductor-audio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reproductor-audio.component.html',
  styleUrls: ['./reproductor-audio.component.scss']
})
export class ReproductorAudioComponent {
  @Input() url = '';
}
