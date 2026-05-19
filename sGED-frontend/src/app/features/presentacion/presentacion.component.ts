import {
  ChangeDetectionStrategy, Component, HostListener, inject, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresentacionService } from './presentacion.service';
import { PdfMergerService } from './services/pdf-merger.service';
import { PresViewerComponent } from './components/pres-viewer/pres-viewer.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-presentacion',
  standalone: true,
  imports: [CommonModule, PresViewerComponent],
  providers: [PresentacionService, PdfMergerService],
  templateUrl: './presentacion.component.html',
  styleUrls: ['./presentacion.component.scss']
})
export class PresentacionComponent {
  protected svc = inject(PresentacionService);
  protected dto = this.svc.dto;

  protected dragSrcIdx = signal<number | null>(null);
  protected dragOverIdx = signal<number | null>(null);

  onActiveIdxChange(idx: number): void {
    this.dto.activeDocIdx.set(idx);
  }

  scrollToDoc(idx: number): void {
    this.svc.scrollToDoc(idx);
  }

  onDragStart(e: DragEvent, i: number): void {
    this.dragSrcIdx.set(i);
    e.dataTransfer!.effectAllowed = 'move';
    e.dataTransfer!.setData('text/plain', String(i));
  }

  onDragOver(e: DragEvent, i: number): void {
    e.preventDefault();
    if (this.dragSrcIdx() !== null && this.dragSrcIdx() !== i) this.dragOverIdx.set(i);
  }

  onDragLeave(_e: DragEvent, i: number): void {
    if (this.dragOverIdx() === i) this.dragOverIdx.set(null);
  }

  onDrop(e: DragEvent, i: number): void {
    e.preventDefault();
    const from = this.dragSrcIdx();
    this.dragOverIdx.set(null);
    if (from === null || from === i) return;
    this.svc.reorderDocs(from, i);
  }

  onDragEnd(): void {
    this.dragSrcIdx.set(null);
    this.dragOverIdx.set(null);
  }

  @HostListener('window:keydown.escape')
  onEscape(): void { this.svc.exit(); }
}
