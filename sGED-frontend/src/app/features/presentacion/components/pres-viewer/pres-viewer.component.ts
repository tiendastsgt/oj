import {
  AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter,
  Input, NgZone, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as pdfjsLib from 'pdfjs-dist';
import { TextLayer } from 'pdfjs-dist';
import { PresentacionDoc, MergeState, findDocIdxForPage } from '../../presentacion.types';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.mjs';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-pres-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pres-viewer.component.html',
  styleUrls: ['./pres-viewer.component.scss'],
})
export class PresViewerComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) mergedPdfUrl: string | null = null;
  @Input({ required: true }) pageOffsets: number[] = [];
  @Input({ required: true }) docs: PresentacionDoc[] = [];
  @Input() scrollTargetTick: { page: number; nonce: number } | null = null;
  @Input() mergeState: MergeState = 'idle';
  @Input() totalPages: number = 0;

  @Output() activeDocIdxChange = new EventEmitter<number>();

  // #pagesHost está siempre en el DOM (sin @if) para que ViewChild sea estable
  @ViewChild('pagesHost') pagesHost?: ElementRef<HTMLDivElement>;

  private observer?: IntersectionObserver;
  private renderAbortController = new AbortController();
  private viewInitialized = false;
  private pendingUrl: string | null = null;

  constructor(private readonly zone: NgZone) {}

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    if (this.pendingUrl) {
      const url = this.pendingUrl;
      this.pendingUrl = null;
      this.zone.runOutsideAngular(() => this.renderMergedPdf(url));
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mergedPdfUrl']) {
      this.cancelRender();
      this.clearContainer();
      if (this.mergedPdfUrl) {
        if (this.viewInitialized) {
          const url = this.mergedPdfUrl;
          this.zone.runOutsideAngular(() => this.renderMergedPdf(url));
        } else {
          this.pendingUrl = this.mergedPdfUrl;
        }
      }
    }
    if (changes['scrollTargetTick'] && this.scrollTargetTick) {
      const host = this.pagesHost?.nativeElement;
      const el = host?.querySelector(`[data-page-idx="${this.scrollTargetTick.page}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.renderAbortController.abort();
  }

  private cancelRender(): void {
    this.renderAbortController.abort();
    this.renderAbortController = new AbortController();
  }

  private clearContainer(): void {
    this.observer?.disconnect();
    this.observer = undefined;
    const host = this.pagesHost?.nativeElement;
    if (host) host.innerHTML = '';
  }

  private setupScrollSpy(): void {
    this.observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (!visible.length) return;
      const pageIdx = Number((visible[0].target as HTMLElement).dataset['pageIdx']);
      const docIdx = findDocIdxForPage(pageIdx, this.pageOffsets);
      this.zone.run(() => this.activeDocIdxChange.emit(docIdx));
    }, { threshold: 0.15, rootMargin: '0px 0px -75% 0px' });
  }

  private async renderMergedPdf(url: string): Promise<void> {
    const signal = this.renderAbortController.signal;
    const host = this.pagesHost?.nativeElement;
    if (!host) return;

    this.setupScrollSpy();

    let pdf: pdfjsLib.PDFDocumentProxy;
    try {
      pdf = await pdfjsLib.getDocument(url).promise;
    } catch {
      return;
    }

    const containerWidth = host.clientWidth || 900;

    for (let pageIdx = 0; pageIdx < pdf.numPages; pageIdx++) {
      if (signal.aborted) return;

      const page = await pdf.getPage(pageIdx + 1);
      const baseVp = page.getViewport({ scale: 1 });
      const scale = Math.min((containerWidth - 48) / baseVp.width, 2);
      const vp = page.getViewport({ scale });

      const wrapper = document.createElement('div');
      wrapper.className = 'pres-page';
      wrapper.dataset['pageIdx'] = String(pageIdx);

      const docIdx = findDocIdxForPage(pageIdx, this.pageOffsets);
      if (this.pageOffsets[docIdx] === pageIdx && this.docs[docIdx]) {
        const marker = document.createElement('div');
        marker.className = 'pres-page-marker';
        marker.textContent = this.docs[docIdx].name;
        wrapper.appendChild(marker);
      }

      const canvas = document.createElement('canvas');
      canvas.className = 'pres-pdf-page';
      canvas.width = vp.width;
      canvas.height = vp.height;

      const textLyr = document.createElement('div');
      textLyr.className = 'textLayer';
      textLyr.style.width = vp.width + 'px';
      textLyr.style.height = vp.height + 'px';

      wrapper.appendChild(canvas);
      wrapper.appendChild(textLyr);
      host.appendChild(wrapper);
      this.observer!.observe(wrapper);

      const ctx = canvas.getContext('2d')!;
      await page.render({ canvasContext: ctx as unknown as CanvasRenderingContext2D, viewport: vp }).promise;

      if (!signal.aborted) {
        const textContent = await page.getTextContent();
        const tl = new TextLayer({ textContentSource: textContent, container: textLyr, viewport: vp });
        await tl.render();
      }
    }
  }
}
