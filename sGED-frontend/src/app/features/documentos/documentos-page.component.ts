import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { DocumentosPageService } from './documentos-page.service';
import { DocumentosUploadComponent } from './components/documentos-upload/documentos-upload.component';
import { DocumentosListComponent } from './components/documentos-list/documentos-list.component';
import { VisorPdfComponent } from './components/visor-pdf/visor-pdf.component';
import { VisorImagenComponent } from './components/visor-imagen/visor-imagen.component';
import { ReproductorAudioComponent } from './components/reproductor-audio/reproductor-audio.component';
import { ReproductorVideoComponent } from './components/reproductor-video/reproductor-video.component';

@Component({
  selector: 'app-documentos-page',
  templateUrl: './documentos-page.component.html',
  styleUrls: ['./documentos-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    DialogModule,
    DocumentosUploadComponent,
    DocumentosListComponent,
    VisorPdfComponent,
    VisorImagenComponent,
    ReproductorAudioComponent,
    ReproductorVideoComponent,
  ],
  providers: [DocumentosPageService],
})
export class DocumentosPageComponent {
  protected svc = inject(DocumentosPageService);
  protected dto = this.svc.dto;
}
