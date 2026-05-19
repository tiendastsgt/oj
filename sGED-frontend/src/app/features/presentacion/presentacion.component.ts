import {
  ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresentacionService } from './presentacion.service';
import { DocumentoViewerComponent } from '../expedientes/documento-viewer/documento-viewer.component';
import { toDocumento } from './presentacion.types';

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

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  selectDoc(idx: number): void {
    this.dto.activeDocIdx.set(idx);
  }

  next(): void {
    if (this.dto.activeDocIdx() < this.dto.total() - 1) {
      this.dto.activeDocIdx.update(idx => idx + 1);
    }
  }

  prev(): void {
    if (this.dto.activeDocIdx() > 0) {
      this.dto.activeDocIdx.update(idx => idx - 1);
    }
  }

  print(): void {
    window.print();
  }

  @HostListener('window:keydown.arrowRight')
  @HostListener('window:keydown.arrowDown')
  onNextKey(): void { this.next(); }

  @HostListener('window:keydown.arrowLeft')
  @HostListener('window:keydown.arrowUp')
  onPrevKey(): void { this.prev(); }

  @HostListener('window:keydown.escape')
  onEscape(): void { this.svc.exit(); }
}
