import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-reproductor-video',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reproductor-video.component.html',
  styleUrls: ['./reproductor-video.component.scss']
})
export class ReproductorVideoComponent {
  @Input() url = '';
}
