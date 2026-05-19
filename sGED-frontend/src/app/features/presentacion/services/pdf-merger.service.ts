import { Injectable } from '@angular/core';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { PresentacionDoc } from '../presentacion.types';

export interface MergeResult {
  blobUrl: string;
  pageOffsets: number[];
  totalPages: number;
}

@Injectable()
export class PdfMergerService {

  async merge(
    docs: PresentacionDoc[],
    fetchBytes: (doc: PresentacionDoc) => Promise<{ bytes: ArrayBuffer; mime: string } | null>
  ): Promise<MergeResult> {
    const mergedPdf = await PDFDocument.create();
    const offsets: number[] = [];
    let runningOffset = 0;

    for (const doc of docs) {
      offsets.push(runningOffset);
      let fetched: { bytes: ArrayBuffer; mime: string } | null = null;
      try {
        fetched = await fetchBytes(doc);
      } catch {
        fetched = null;
      }

      if (fetched === null) {
        await this.addPlaceholderPage(mergedPdf, doc, 'No disponible');
        runningOffset += 1;
        continue;
      }

      if (doc.type === 'pdf' || doc.type === 'doc') {
        try {
          const src = await PDFDocument.load(fetched.bytes, { ignoreEncryption: true });
          const copied = await mergedPdf.copyPages(src, src.getPageIndices());
          copied.forEach(p => mergedPdf.addPage(p));
          runningOffset += src.getPageCount();
        } catch {
          await this.addPlaceholderPage(mergedPdf, doc, 'Error al cargar documento');
          runningOffset += 1;
        }
      } else if (doc.type === 'img') {
        try {
          let embedded;
          try {
            embedded = await mergedPdf.embedJpg(fetched.bytes);
          } catch {
            embedded = await mergedPdf.embedPng(fetched.bytes);
          }
          const page = mergedPdf.addPage([embedded.width, embedded.height]);
          page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
          runningOffset += 1;
        } catch {
          await this.addPlaceholderPage(mergedPdf, doc, 'Imagen no compatible');
          runningOffset += 1;
        }
      } else {
        await this.addPlaceholderPage(mergedPdf, doc, `Documento ${doc.type.toUpperCase()} — sin previsualización`);
        runningOffset += 1;
      }
    }

    const bytes = await mergedPdf.save();
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    return {
      blobUrl: URL.createObjectURL(blob),
      pageOffsets: offsets,
      totalPages: runningOffset
    };
  }

  private async addPlaceholderPage(mergedPdf: PDFDocument, doc: PresentacionDoc, msg: string): Promise<void> {
    const page = mergedPdf.addPage([595, 842]); // A4
    const font = await mergedPdf.embedFont(StandardFonts.Helvetica);
    const title = doc.name.length > 60 ? doc.name.substring(0, 60) + '…' : doc.name;
    page.drawText(title, {
      x: 50, y: 750,
      size: 14,
      font,
      color: rgb(0.1, 0.1, 0.1)
    });
    page.drawText(msg, {
      x: 50, y: 720,
      size: 11,
      font,
      color: rgb(0.5, 0.5, 0.5)
    });
  }
}
