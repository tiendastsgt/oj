import {
  ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PDFDocument } from 'pdf-lib';
import { PresentacionService } from './presentacion.service';
import { DocumentoViewerComponent } from '../expedientes/documento-viewer/documento-viewer.component';
import { toDocumento } from './presentacion.types';
import { environment } from '../../../environments/environment';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-presentacion',
  standalone: true,
  imports: [CommonModule, DocumentoViewerComponent],
  providers: [PresentacionService],
  templateUrl: './presentacion.component.html',
  styleUrls: ['./presentacion.component.scss']
})
export class PresentacionComponent implements OnInit, OnDestroy {
  protected svc = inject(PresentacionService);
  protected dto = this.svc.dto;
  protected readonly toDocumento = toDocumento;

  private observer?: IntersectionObserver;

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
    this.setupScrollSpy();
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
    this.observer?.disconnect();
  }

  setupScrollSpy(): void {
    setTimeout(() => {
      const options = {
        root: document.querySelector('.pres-scroll'),
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
      };
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idxAttr = entry.target.getAttribute('data-doc-idx');
            if (idxAttr !== null) {
              this.dto.activeDocIdx.set(parseInt(idxAttr, 10));
            }
          }
        });
      }, options);
      document.querySelectorAll('.pres-doc-section').forEach(sec => this.observer?.observe(sec));
    }, 500);
  }

  scrollToDoc(idx: number): void {
    const el = document.getElementById(`pres-doc-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.dto.activeDocIdx.set(idx);
    }
  }

  async print(): Promise<void> {
    const validSamples = [
      'Demanda_Inicial.pdf', 'Resolucion_Admision.pdf', 'Contestacion_Demanda.pdf',
      'Auto_Medida_Cautelar.pdf', 'Sentencia_Ordinario.pdf',
      'Acta_Audiencia_Penal.pdf', 'Cedula_Notificacion.pdf'
    ];

    try {
      const mergedPdf = await PDFDocument.create();
      const docs = this.dto.docs();

      for (const doc of docs) {
        let fileUrl = '';
        if (environment.useMocks) {
          if (doc.type === 'pdf' || doc.type === 'doc') {
            const fileName = validSamples.includes(doc.name) ? doc.name : 'sample-doc.pdf';
            fileUrl = `/assets/demo/${fileName}`;
          } else if (doc.type === 'img') {
            fileUrl = '/assets/demo/sample.jpg';
          }
        }

        if (!fileUrl) continue;

        if (doc.type === 'pdf' || doc.name.endsWith('.pdf')) {
          const bytes = await fetch(fileUrl).then(r => r.arrayBuffer());
          const pdf = await PDFDocument.load(bytes);
          const copied = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copied.forEach(p => mergedPdf.addPage(p));
        } else if (doc.type === 'img') {
          const imgBytes = await fetch(fileUrl).then(r => r.arrayBuffer());
          const embedded = fileUrl.endsWith('.png')
            ? await mergedPdf.embedPng(imgBytes)
            : await mergedPdf.embedJpg(imgBytes);
          const page = mergedPdf.addPage([embedded.width, embedded.height]);
          page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
        }
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(url);
      }, 10000);
    } catch {
      window.print();
    }
  }

  @HostListener('window:keydown.escape')
  onEscape(): void { this.svc.exit(); }
}
