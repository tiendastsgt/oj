import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component,
  ElementRef, EventEmitter, Input, NgZone, OnDestroy, Output, QueryList, ViewChildren
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as pdfjsLib from 'pdfjs-dist';
import { PresentacionDoc } from '../../presentacion.types';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.mjs';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-pres-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pres-viewer.component.html',
  styleUrls: ['./pres-viewer.component.scss'],
})
export class PresViewerComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) docs: PresentacionDoc[] = [];
  @Input({ required: true }) urls: (string | null)[] = [];
  @Output() activeIdxChange = new EventEmitter<number>();

  @ViewChildren('pagesEl') pagesEls!: QueryList<ElementRef<HTMLDivElement>>;
  @ViewChildren('sectionEl') sectionEls!: QueryList<ElementRef<HTMLElement>>;

  private observer?: IntersectionObserver;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly zone: NgZone,
  ) {}

  ngAfterViewInit(): void {
    this.setupIntersection();
    this.zone.runOutsideAngular(() => this.renderAll());
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private setupIntersection(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const idx = Number((visible[0].target as HTMLElement).dataset['docIdx'] ?? 0);
          this.zone.run(() => this.activeIdxChange.emit(idx));
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -80% 0px' }
    );
    this.sectionEls.forEach(el => this.observer!.observe(el.nativeElement));
  }

  private async renderAll(): Promise<void> {
    for (let i = 0; i < this.docs.length; i++) {
      const url = this.urls[i];
      const pagesEl = this.pagesEls.get(i)?.nativeElement;
      if (!pagesEl) continue;

      if (!url) {
        this.appendPlaceholder(pagesEl, this.docs[i].type);
        continue;
      }

      try {
        const pdf = await pdfjsLib.getDocument(url).promise;
        const containerWidth = pagesEl.parentElement?.clientWidth ?? 900;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const baseViewport = page.getViewport({ scale: 1 });
          const scale = Math.min((containerWidth - 48) / baseViewport.width, 2);
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement('canvas');
          canvas.className = 'pres-pdf-page';
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          const ctx = canvas.getContext('2d')!;
          await page.render({ canvasContext: ctx as unknown as CanvasRenderingContext2D, viewport }).promise;
          pagesEl.appendChild(canvas);
        }
      } catch {
        const errEl = document.createElement('div');
        errEl.className = 'pres-pdf-error';
        errEl.textContent = 'No se pudo cargar el documento';
        pagesEl.appendChild(errEl);
        this.zone.run(() => this.cdr.markForCheck());
      }
    }
    this.zone.run(() => this.cdr.markForCheck());
  }

  private appendPlaceholder(container: HTMLDivElement, type: string): void {
    const el = document.createElement('div');
    el.className = `pres-pdf-placeholder tipo-${type}`;
    el.textContent = `${type.toUpperCase()} · modo demo`;
    container.appendChild(el);
  }
}
