import { NgModule } from '@angular/core';
import { DocumentosPageComponent } from './documentos-page.component';
import { DocumentosUploadComponent } from './upload/documentos-upload.component';
import { DocumentosListComponent } from './list/documentos-list.component';
import { VisorPdfComponent } from './visor-pdf/visor-pdf.component';
import { VisorImagenComponent } from './visor-imagen/visor-imagen.component';
import { ReproductorAudioComponent } from './reproductor-audio/reproductor-audio.component';
import { ReproductorVideoComponent } from './reproductor-video/reproductor-video.component';

@NgModule({
  imports: [
    DocumentosPageComponent,
    DocumentosUploadComponent,
    DocumentosListComponent,
    VisorPdfComponent,
    VisorImagenComponent,
    ReproductorAudioComponent,
    ReproductorVideoComponent
  ],
  exports: [DocumentosPageComponent]
})
export class DocumentosModule {}
